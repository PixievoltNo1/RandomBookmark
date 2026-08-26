import chooseBookmark from './bookmarkSelection.mjs';
import l10n from "./l10nStore.mjs";
import { stores, ready as storageReady } from './storage.mjs';
import { mount } from 'svelte';
import UiRoot from './svelte/UiRoot.svelte';
import { getBrowserType, isVivaldi } from './sniffBrowser.mjs';
import { writable, get as readStore } from 'svelte/store';
import { set as idbSet, get as idbGet, createStore as idbCreateStore } from "idb-keyval";

var folderBookmarkNodes = new Map();
var cacheStore = idbCreateStore("cache", "keyval");
export var bookmarksReady = writable(false);
export async function onChosen({id, andSubfolders}) {
	if ( !readStore(bookmarksReady) ) {
		chrome.runtime.sendMessage({
			name: "pickBookmark",
			folderId: id,
			useSubfolders: andSubfolders,
		});
		window.close();
		return;
	}
	var node = folderBookmarkNodes.get(id);
	var bookmark = chooseBookmark(node, andSubfolders);
	if (!bookmark) {
		alert( readStore(l10n)("error_noBookmarks") );
		return;
	}
	try {
		if ( readStore(stores.openInNewTab) ) {
			await chrome.tabs.create({url: bookmark.url});
		} else {
			await chrome.tabs.update({url: bookmark.url});
		}
	} catch {
		let tabId = readStore(stores.openInNewTab)
			? (await chrome.tabs.create({url: "about:blank"})).id
		    : (await chrome.tabs.query({active: true}))[0].id;
		chrome.runtime.sendMessage({
			name: "errorPage",
			tabId,
			errorName: "openingNotAllowed",
			errorDetails: [bookmark.url],
		});

	}
	await chrome.storage.local.set({
		lastPickFolderId: id,
		lastPickSubfolders: andSubfolders,
	}).catch( console.error );
	window.close();
}
export function onTogglePin(id, on) {
	var pins = readStore(stores.pins);
	pins[on ? "add" : "delete"](id);
	stores.pins.set(pins);
	uiRoot.pinsDirtied();
}
export function cleanPins(missingPins) {
	var pins = readStore(stores.pins);
	for (let id of missingPins) {
		pins.delete(id);
	}
	stores.pins.set(pins);
	uiRoot.updateMissingPins(null);
}
var uiRoot = mount(UiRoot, { target: document.body });
{
	var browserType = getBrowserType();

	var browserDisplayHelper = ({
		async Chrome() {
			// Workaround for CSS body { overflow: hidden; } not working correctly
			var body = document.body;
			getComputedStyle(body).height; // force layout
			var maxWindowSize = window.innerHeight;
			// Minus-1 needed to ensure the scrollbar is banished
			body.style.height = `${maxWindowSize - 1}px`;
			if (isVivaldi()) {
				// Workaround for Vivaldi 8.1 not limiting the height on first open
				// Unlike other browsers, Vivaldi won't let the popup extend out of the window
				let curWindow = await browser.windows.getCurrent();
				body.style.height = `${curWindow.height - 100}px`;
			}
		},
		async Firefox() {
			// Workaround for cutoff when ui.html is shown in the overflow menu
			var curWindow = await browser.windows.getCurrent();
			document.body.style.height =
				`${screen.availHeight - Math.max(curWindow.top, 0) - 150}px`;
			document.getElementById("flexContainer").style.maxHeight = "100%";
		},
	})[browserType];
	if (browserDisplayHelper) { browserDisplayHelper(); }

	uiRoot.updateAutoNav( ({
		Chrome(navTree) {
			// TODO: Use new folderType property
			var autoOpenThese = new Set(["1", "2"]);
			for (let navNode of navTree) {
				if (autoOpenThese.has(navNode.id)) {
					navNode.expand();
				}
			}
		},
		Firefox(navTree) {
			var autoOpenThese = new Set(["menu________", "toolbar_____"]);
			for (let navNode of navTree) {
				if (autoOpenThese.has(navNode.id)) {
					navNode.expand();
				}
			}
		},
	})[browserType] );
}
var bookmarksFetch = new Promise( (resolve) => {
	chrome.bookmarks.getTree( ([tree]) => { resolve(tree); } );
} );
var cacheFetch = idbGet("folderCache", cacheStore);
(async function() {
	await Promise.all([storageReady]);

	var cache = await cacheFetch;
	if (cache) {
		let {pinList} = findPins(cache); // deliberately ignoring missingPins
		uiRoot.updateLists({folderList: cache, pinList});
	}

	var tree = await bookmarksFetch;
	var folderList = makeFolderList(tree).list;
	var {pinList, missingPins} = findPins(folderList);
	uiRoot.updateLists({pinList, folderList});
	uiRoot.updateMissingPins(missingPins);
	bookmarksReady.set(true);
	idbSet("folderCache", folderList, cacheStore);
	chrome.alarms.create("clearCache", {delayInMinutes: 15});
})();
function makeFolderList(tree) {
	// TODO: Detect and disambiguate same-named syncing and non-syncing folders
	var list = [], hasChildBookmarks = false, hasDescendantBookmarks = false;
	for (let bookmarkNode of tree.children) {
		if (bookmarkNode.type == "separator") {
			if (list.length && !list[list.length - 1].separator) {
				list.push({separator: true});
			}
			continue;
		}
		if (bookmarkNode.title == "") {
			// Blank-title folders are present in Firefox and contain uninteresting things like history, downloads, etc.
			continue;
		}
		if (!bookmarkNode.children) {
			if (bookmarkNode.url) { hasChildBookmarks = hasDescendantBookmarks = true; }
			continue;
		}
		let folderData = makeFolderList(bookmarkNode);
		folderData.id = bookmarkNode.id;
		folderData.title = bookmarkNode.title;
		folderBookmarkNodes.set(bookmarkNode.id, bookmarkNode);
		list.push(folderData);
		if (folderData.hasDescendantBookmarks) {
			hasDescendantBookmarks = true;
		}
	}
	while (list.length && list[list.length - 1].separator) {
		list.pop();
	}
	return {list, hasChildBookmarks, hasDescendantBookmarks};
}
function findPins(folderList) {
	var pinList = [], pinsToFind = new Set( readStore(stores.pins) );
	function* allFolders(list) {
		for (let folder of list) {
			if (folder.separator) { continue; }
			yield folder;
			yield* allFolders(folder.list);
		}
	};
	for (let folder of allFolders(folderList)) {
		if (!pinsToFind.size) {
			break;
		}
		if (pinsToFind.has(folder.id)) {
			pinList.push(folder);
			pinsToFind.delete(folder.id);
		}
	}
	return {pinList, missingPins: pinsToFind};
}
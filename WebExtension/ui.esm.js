import chooseBookmark from './bookmarkSelection.esm.js';
import l10n from "./l10nStore.esm.js";
import { stores, ready as storageReady } from './storage.esm.js';
import UiRoot from './svelte/UiRoot.svelte';
import sniffBrowser from './sniffBrowser.esm.js';
import { writable, get as readStore } from 'svelte/store';
import { set as idbSet, get as idbGet, Store as IdbKeyvalStore } from "idb-keyval";
import sweetAlert from "SweetAlert2/dist/sweetalert2.js";

var folderBookmarkNodes = new Map();
var cacheStore = new IdbKeyvalStore("cache", "keyval");
export var bookmarksReady = writable(false);
export async function onChosen({id, andSubfolders}) {
	if ( !readStore(bookmarksReady) ) {
		sweetAlert.fire({
			text: readStore(l10n)("wait"),
			showConfirmButton: false,
			allowEscapeKey: false,
			allowOutsideClick: false,
		});
		await new Promise( (resolve) => {
			var unsubscribe = bookmarksReady.subscribe( (value) => {
				if (value) {
					unsubscribe();
					resolve();
				};
			} );
		} );
	}
	var node = folderBookmarkNodes.get(id);
	var bookmark = chooseBookmark(node, andSubfolders);
	if (!bookmark) {
		sweetAlert.fire({
			animation: false,
			text: readStore(l10n)("noBookmarksFound"),
			confirmButtonText: readStore(l10n)("ok"),
		});
		return;
	}
	if ( readStore(stores.openInNewTab) ) {
		chrome.tabs.create({url: bookmark.url}, checkForError);
	} else {
		chrome.tabs.update({url: bookmark.url}, checkForError);
	}
	function checkForError() {
		if ( !chrome.runtime.lastError ) {
			window.close();
		} else {
			sweetAlert.fire({
				animation: !sweetAlert.isVisible(),
				text: readStore(l10n)("couldntOpen") + "\n" + bookmark.url,
				confirmButtonText: readStore(l10n)("ok"),
			});
		}
	}
}
export function onTogglePin(id, on) {
	var pins = readStore(stores.pins);
	pins[on ? "add" : "delete"](id);
	stores.pins.set(pins);
	uiRoot.$set({pinsDirty: true});
}
export function cleanPins(missingPins) {
	var pins = readStore(stores.pins);
	for (let id of missingPins) {
		pins.delete(id);
	}
	stores.pins.set(pins);
	uiRoot.$set({missingPins: null});
}
var uiRoot = new UiRoot({ target: document.body });
var adaptToBrowser = (async function(browserName) {
	var browserName = await sniffBrowser();

	var browserDisplayHelper = ({
		Chrome() {
			// Workaround for CSS body { overflow: hidden; } not working correctly
			var body = document.body, flexContainer = document.getElementById("flexContainer");
			getComputedStyle(body).height; // force layout
			var maxWindowSize = window.innerHeight;
			// Minus-1 needed to ensure the scrollbar is banished
			body.style.height = flexContainer.style.height = `${maxWindowSize - 1}px`;
		},
		Firefox: async function() {
			// Workaround for cutoff when ui.html is shown in the overflow menu
			var curWindow = await browser.windows.getCurrent();
			document.body.style.height =
				`${screen.availHeight - Math.max(curWindow.top, 0) - 150}px`;
			document.getElementById("flexContainer").style.maxHeight = "100%";
		},
	})[browserName];
	if (browserDisplayHelper) { browserDisplayHelper(); }

	uiRoot.$set({folderListAutoNav: ({
		Chrome(navTree) {
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
	})[browserName]})
})();
var bookmarksFetch = new Promise( (resolve) => {
	chrome.bookmarks.getTree( ([tree]) => { resolve(tree); } );
} );
var cacheFetch = idbGet("folderCache", cacheStore);
(async function() {
	await Promise.all([adaptToBrowser, storageReady]);

	var cache = await cacheFetch;
	if (cache) {
		let {pinList} = findPins(cache); // deliberately ignoring missingPins
		uiRoot.$set({folderList: cache, pinList});
	}

	var tree = await bookmarksFetch;
	var folderList = makeFolderList(tree).list;
	var {pinList, missingPins} = findPins(folderList);
	uiRoot.$set({pinList, folderList, missingPins});
	bookmarksReady.set(true);
	idbSet("folderCache", folderList, cacheStore);
	chrome.alarms.create("clearCache", {delayInMinutes: 15});
})();
function makeFolderList(tree) {
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
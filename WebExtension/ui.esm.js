import chooseBookmark from './bookmarkSelection.esm.js';
import l10n from "./l10nStore.esm.js";
import { stores, ready as storageReady } from './storage.esm.js';
import UiRoot from './svelte/UiRoot.svelte';
import sniffBrowser from './sniffBrowser.esm.js';
import { writable, get as readStore } from 'svelte/store';
import { set as idbSet, get as idbGet, Store as IdbKeyvalStore } from "idb-keyval";
import sweetalert from "SweetAlert2";

var folderBookmarkNodes = new Map();
var cacheStore = new IdbKeyvalStore("cache", "keyval");
export var bookmarksReady = writable(false);
export async function onChosen({id, andSubfolders}) {
	if ( !readStore(bookmarksReady) ) {
		sweetalert.fire({
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
		sweetalert.fire({
			animation: false,
			text: readStore(l10n)("noBookmarksFound"),
			confirmButtonText: readStore(l10n)("ok"),
		});
		return;
	}
	chrome.tabs.create({url: bookmark.url});
	window.close();
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
			getComputedStyle(document.body).height; // force layout
			document.body.style.height = "auto";

			document.getElementById("optionsPane").style.paddingBottom = "4px";
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
		uiRoot.$set({folderList: cache});
	}
	var tree = await bookmarksFetch;
	var pinList = [], pinsToFind = new Set( readStore(stores.pins) );
	function perFolder(folder, node) {
		var {id} = folder;
		folderBookmarkNodes.set(id, node);
		if (pinsToFind.has(id)) {
			pinList.push(folder);
			pinsToFind.delete(id);
		}
	}
	var folderList = makeFolderList(tree, perFolder).list;
	uiRoot.$set({pinList, folderList});
	bookmarksReady.set(true);
	if (pinsToFind.size) { uiRoot.$set({missingPins: pinsToFind}); }
	idbSet("folderCache", folderList, cacheStore);
	chrome.alarms.create("clearCache", {delayInMinutes: 15});
})();
function makeFolderList(tree, perFolder) {
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
		let folderData = makeFolderList(bookmarkNode, perFolder);
		folderData.id = bookmarkNode.id;
		folderData.title = bookmarkNode.title;
		perFolder(folderData, bookmarkNode);
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
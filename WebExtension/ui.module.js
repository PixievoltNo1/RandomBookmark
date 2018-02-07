if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }
import chooseBookmark from './bookmarkSelection.js';
import UiRoot from './svelteComponents/UiRoot.html';
import FolderNode from './svelteComponents/FolderNode.html';
import { Store } from 'svelte/store';

var l10nCached = {};
for (let message of FolderNode.cacheL10n) {
	l10nCached[message] = chrome.i18n.getMessage(message);
}
var store = new Store({
	l10n: chrome.i18n.getMessage,
	l10nCached,
});
var uiRoot = new UiRoot({
	target: document.body,
	store
});
uiRoot.on("chosen", ({node, andSubfolders}) => {
	var bookmark = chooseBookmark(node, andSubfolders);
	window.open(bookmark.url);
});
Promise.all([
	new Promise((resolve) => { chrome.bookmarks.getTree(([tree]) => { resolve(tree); }); }),
	// TODO: Get user prefs
]).then(([tree, prefs]) => {
	store.set({
		// TODO: Use prefs
		searchIn: "folderOnly",
		showAndSubfolders: true,
		prefsReady: true,
	});
	uiRoot.set({
		pinList: [],
		folderList: makeFolderList(tree).list,
	});
});
function makeFolderList(tree) {
	var list = [], hasChildBookmarks = false, hasDescendantBookmarks = false;
	for (let bookmarkNode of tree.children) {
		if (bookmarkNode.title == "") {
			// Blank-title folders are present in Firefox and contain uninteresting things like history, downloads, etc.
			continue;
		}
		if (bookmarkNode.type == "separator") {
			if (list.length && !list[list.length - 1].separator) {
				list.push({separator: true});
			}
			continue;
		}
		if (!bookmarkNode.children) {
			if (bookmarkNode.url) { hasChildBookmarks = hasDescendantBookmarks = true; }
			continue;
		}
		let folderData = Object.assign(makeFolderList(bookmarkNode), {node: bookmarkNode});
		// TODO: Check for bookmarks menu/toolbar folders and set subfolderOpen: true
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
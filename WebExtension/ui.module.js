if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }
import chooseBookmark from './bookmarkSelection.js';
import FolderNodeList from './svelteComponents/FolderNodeList.html';
import { Store } from 'svelte/store';

Promise.all([
	new Promise((resolve) => { chrome.bookmarks.getTree(([tree]) => { resolve(tree); }); }),
	// TODO: Get user prefs
]).then(([tree, prefs]) => {
	var store = new Store({
		// TODO: Use prefs
		searchIn: "folderOnly",
		showAndSubfolders: true,
		l10n_andSubfolders: chrome.i18n.getMessage("andSubfolders"),
	});
	var folders = new FolderNodeList({
		target: document.getElementById("mainList"),
		data: {list: makeFolderList(tree).list},
		store
	});
	folders.on("chosen", ({node, andSubfolders}) => {
		var bookmark = chooseBookmark(node, andSubfolders);
		window.open(bookmark.url);
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
if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }
import chooseBookmark from './bookmarkSelection.js';
import folderNode from './svelteComponents/folderNode.html';
import { Store } from 'svelte/store';

chrome.bookmarks.getTree((tree) => { makeFolderList(tree[0], document.getElementById("mainList")); });
var store = new Store({
	// TODO: Get user preferences
	searchIn: "folderOnly",
	showAndSubfolders: true,
	l10n_andSubfolders: chrome.i18n.getMessage("andSubfolders"),
});
function makeFolderList(tree, menu) {
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
		let subfolderMenu = document.createDocumentFragment();
		let folderData = makeFolderList(bookmarkNode, subfolderMenu);
		list.push(folderData);
		if (folderData.hasDescendantBookmarks) {
			hasDescendantBookmarks = true;
		}
		let uiNode = new folderNode({
			target: menu,
			data: Object.assign(folderData, {node: bookmarkNode}),
			store,
		});
		if (folderData.list.length) {
			uiNode.refs.subfolders.appendChild(subfolderMenu);
		}
		uiNode.on("chosen", ({node, andSubfolders}) => {
			var bookmark = chooseBookmark(node, andSubfolders);
			window.open(bookmark.url);
		});
	}
	while (list.length && list[list.length - 1].separator) {
		list.pop();
	}
	return {list, hasChildBookmarks, hasDescendantBookmarks};
}
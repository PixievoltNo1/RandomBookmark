if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }
import chooseBookmark from './bookmarkSelection.module.js';
import storePersist from './storePersist.module.js';
import UiRoot from './svelteComponents/UiRoot.html';
import FolderNode from './svelteComponents/FolderNode.html';
import sniffBrowser from './sniffBrowser.module.js';
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
store.onChosen = ({node, andSubfolders}) => {
	var bookmark = chooseBookmark(node, andSubfolders);
	chrome.tabs.create({url: bookmark.url});
	window.close();
};
store.onTogglePin = (id, on) => {
	var pins = store.get("pins");
	pins[on ? "add" : "delete"](id);
	store.set({pins});
	uiRoot.set({pinsDirty: true});
};
store.cleanPins = () => {
	var pins = store.get("pins");
	for (let id of uiRoot.get("missingPins")) {
		pins.delete(id);
	}
	store.set({pins});
	uiRoot.set({missingPins: null});
}
var browserCheck = sniffBrowser();
browserCheck.then((browserName) => {
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
});
Promise.all([
	new Promise((resolve) => { chrome.bookmarks.getTree(([tree]) => { resolve(tree); }); }),
	browserCheck,
	storePersist(store)
]).then(([tree, browserName]) => {
	// TODO: Determine what should open automatically
	var pinList = [], autoOpen = new Set();
	var pinsToFind = new Set(store.get("pins"));
	function pinCheck(folder) {
		var id = folder.node.id;
		if (pinsToFind.has(id)) {
			pinList.push(folder);
			pinsToFind.delete(id);
		}
	}
	if (browserName == "Edge") {
		tree = {children: [tree]};
	}
	var folderList = makeFolderList(tree, pinCheck).list;
	var browserDataHelper = ({
		Chrome() {
			autoOpen.add(1).add(2);
		},
		Firefox() {
			autoOpen.add("menu________").add("toolbar_____");
		},
		Edge() {
			var root = folderList[0];
			autoOpen.add(root.node.id);
			var toolbar = root.list.find((folder) => {
				if (folder.node.title == "_Favorites_Bar_") { return folder; }
			});
			if (!toolbar) { return; }
			autoOpen.add(toolbar.node.id);
			toolbar.node = {
				__proto__: toolbar.node,
				title: chrome.i18n.getMessage("favoritesBar")
			};
		}
	})[browserName];
	if (browserDataHelper) { browserDataHelper(); }
	uiRoot.set({pinList, folderList, autoOpen});
	if (pinsToFind.size) { uiRoot.set({missingPins: pinsToFind}); }
});
function makeFolderList(tree, pinCheck) {
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
		let folderData = Object.assign(makeFolderList(bookmarkNode, pinCheck), {node: bookmarkNode});
		pinCheck(folderData);
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
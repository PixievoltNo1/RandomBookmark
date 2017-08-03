"use strict";
(function() {

var {Services} = Components.utils.import("resource://gre/modules/Services.jsm", {});
var l10n = Services.strings.createBundle("chrome://RandomBookmarkFromFolder/locale/messages.properties");
var places = Components.classes["@mozilla.org/browser/nav-history-service;1"]
	.getService(Components.interfaces.nsINavHistoryService);
var folderQuery = places.getNewQuery();
var defaultOptions = places.getNewQueryOptions();
var {console} = Components.utils.import("resource://gre/modules/Console.jsm", {});

var cleanupTasks = [];
function removalTask(node) {
	return Element.prototype.removeChild.bind(node.parentNode, node);
}
window.RandomBookmarkFromFolder = {};
cleanupTasks.push( function() {
	delete window.RandomBookmarkFromFolder;
} );

var uiElems = [];
RandomBookmarkFromFolder.setup = function(searchIn) {
	// checkForMiddleClick only triggers the event handler set by the oncommand attribute (bug #928664).
	// The label property won't work for freshly-made elements. Some XBL thing.
	if (uiElems.length) {
		uiCleanup();
		uiElems = [];
	}
	if (searchIn != "any") {
		var menuItem = document.createElement("menuitem");
		menuItem.id = "RandomBookmarkFromFolder";
		menuItem.setAttribute("label", l10n.GetStringFromName("menuItem"));
		menuItem.setAttribute("oncommand", "RandomBookmarkFromFolder.go(event, '" + searchIn + "')");
		commonSetup(menuItem);
	} else {
		var menuItem1 = document.createElement("menuitem");
		menuItem1.id = "RandomBookmarkFromFolder1";
		menuItem1.setAttribute("label", l10n.GetStringFromName("menuItemFolderOnly"));
		menuItem1.setAttribute("oncommand", "RandomBookmarkFromFolder.go(event, 'folder')");
		commonSetup(menuItem1);
		var menuItem2 = document.createElement("menuitem");
		menuItem2.id = "RandomBookmarkFromFolder2";
		menuItem2.setAttribute("label", l10n.GetStringFromName("menuItemFolderAndSubfolders"));
		menuItem2.setAttribute("oncommand", "RandomBookmarkFromFolder.go(event, 'folderAndSubfolders')");
		commonSetup(menuItem2);
	}
	function commonSetup(menuItem) {
		menuItem.setAttribute("selectiontype", "single");
		menuItem.setAttribute("selection", "folder");
		menuItem.setAttribute("forcehideselection", "livemark/feedURI");
		menuItem.setAttribute("onclick", "checkForMiddleClick(this, event)");
		menuItem.setAttribute("class", "menuitem-iconic");
		menuItem.setAttribute("image", "chrome://RandomBookmarkFromFolder/content/MenuIcon.png");
		document.getElementById("placesContext").appendChild(menuItem);
		uiElems.push(menuItem);
	}
}
function uiCleanup() {
	for (let elem of uiElems) {
		elem.remove();
	}
}
cleanupTasks.push(uiCleanup);

RandomBookmarkFromFolder.go = function(event, searchSpace) {
	try {
		var folderID = PlacesUIUtils.getViewForNode(document.popupNode).selectedNode.itemId;
		folderQuery.setFolders([folderID], 1);
		var folder = places.executeQuery(folderQuery, defaultOptions).root;
		var bookmarks = getBookmarks(folder, searchSpace);
		if (bookmarks.length == 0) {
			Services.prompt.alert(window, l10n.GetStringFromName("extName"),
				l10n.GetStringFromName("errNoBookmarks"));
			return;
		}
		var chosen = bookmarks[ Math.floor( Math.random() * bookmarks.length ) ];
		openUILinkIn(chosen.uri, whereToOpenLink(event));
	} catch(e) {
		console.error(e);
		Services.prompt.alert(window, l10n.GetStringFromName("extName"),
			l10n.GetStringFromName("errGeneric"));
	}
}
function getBookmarks(from, searchSpace) {
	var bookmarks = [];
	from.containerOpen = true;
	for (let i = 0; i < from.childCount; ++i) {
		let item = from.getChild(i);
		if (item.type == item.RESULT_TYPE_URI) {
			bookmarks.push(item);
		} else if (item.type == item.RESULT_TYPE_FOLDER && searchSpace == "folderAndSubfolders") {
			let folder = item.QueryInterface(Components.interfaces.nsINavHistoryContainerResultNode);
			bookmarks.push( ...getBookmarks(folder, searchSpace) );
		}
	}
	from.containerOpen = false;
	return bookmarks;
}

RandomBookmarkFromFolder.cleanUp = function() {
	cleanupTasks.forEach( function(task) { task(); } );
};

})();
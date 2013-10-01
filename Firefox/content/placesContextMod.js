"use strict";
(function setup(){

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://RandomBookmarkFromFolder/content/StringBundle.js");
var l10n = new StringBundle("chrome://RandomBookmarkFromFolder/locale/messages.properties");
var extPrefs = Services.prefs.getBranch("extensions.RandomBookmarkFromFolder.");

var cleanupTasks = [];
function removalTask(node) {
	return Element.prototype.removeChild.bind(node.parentNode, node);
}

// The label property won't work for freshly-made elements. Some XBL thing.
var searchIn = extPrefs.getPrefType("searchIn") ? extPrefs.getCharPref("searchIn")
	: "folderAndSubfolders";
if (searchIn != "any") {
	var menuItem = document.createElement("menuitem");
	menuItem.id = "RandomBookmarkFromFolder";
	menuItem.setAttribute("label", l10n.get("menuItem"));
	menuItem.addEventListener("command", fulfillPurpose.bind(searchIn));
	finalPreparation(menuItem);
} else {
	var menuItem1 = document.createElement("menuitem");
	menuItem1.id = "RandomBookmarkFromFolder1";
	menuItem1.setAttribute("label", l10n.get("menuItemFolderOnly"));
	menuItem1.addEventListener("command", fulfillPurpose.bind(window, "folder"));
	finalPreparation(menuItem1);
	var menuItem2 = document.createElement("menuitem");
	menuItem2.id = "RandomBookmarkFromFolder2";
	menuItem2.setAttribute("label", l10n.get("menuItemFolderAndSubfolders"));
	menuItem2.addEventListener("command", fulfillPurpose.bind(window, "folderAndSubfolders"));
	finalPreparation(menuItem2);
}
function finalPreparation(menuItem) {
	menuItem.setAttribute("selectiontype", "single");
	menuItem.setAttribute("selection", "folder");
	menuItem.setAttribute("forcehideselection", "livemark/feedURI");
	document.getElementById("placesContext").appendChild(menuItem);
	cleanupTasks.push( removalTask(menuItem) );
}

function fulfillPurpose(searchSpace, event) {
	var folder = PlacesUIUtils.getViewForNode(document.popupNode).selectedNode
		.QueryInterface(Components.interfaces.nsINavHistoryContainerResultNode);
	var bookmarks = getBookmarks(folder, searchSpace);
	var chosen = bookmarks[ Math.floor( Math.random() * bookmarks.length ) ];
	openUILinkIn(chosen.uri, whereToOpenLink(event))
}
function getBookmarks(from, searchSpace) {
	var bookmarks = [];
	var oldOpenness = from.containerOpen;
	from.containerOpen = true;
	for (let i = 0; i < from.childCount; ++i) {
		let item = from.getChild(i);
		if (item.type == item.RESULT_TYPE_URI) {
			bookmarks.push(item);
		} else if (item.type == item.RESULT_TYPE_FOLDER && searchSpace == "folderAndSubfolders") {
			bookmarks = bookmarks.concat( getBookmarks(item, searchSpace) );
		}
	}
	from.containerOpen = oldOpenness;
	return bookmarks;
}

extPrefs.addObserver("", { observe: function() {
	cleanUpRandomBookmarkFromFolder();
	setup();
} }, false);

window.cleanUpRandomBookmarkFromFolder = function() {
	cleanupTasks.forEach( function(task) { task(); } );
};

})();
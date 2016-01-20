"use strict";
(function setup(){

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://services-common/stringbundle.js");
var l10n = new StringBundle("chrome://RandomBookmarkFromFolder/locale/messages.properties");
var extPrefs = Services.prefs.getBranch("extensions.RandomBookmarkFromFolder.");
var places = Components.classes["@mozilla.org/browser/nav-history-service;1"]
	.getService(Components.interfaces.nsINavHistoryService);
var folderQuery = places.getNewQuery();
var defaultOptions = places.getNewQueryOptions();
try {
	// Works in Fx >=44
	var {console} = Components.utils.import("resource://gre/modules/Console.jsm", {});
} catch (e) {
	var {console} = Components.utils.import("resource://gre/modules/devtools/Console.jsm", {});
}

var cleanupTasks = [];
function removalTask(node) {
	return Element.prototype.removeChild.bind(node.parentNode, node);
}
window.RandomBookmarkFromFolder = {};
cleanupTasks.push( function() {
	delete window.RandomBookmarkFromFolder;
} );

// checkForMiddleClick only triggers the event handler set by the oncommand attribute (bug #928664).
// The label property won't work for freshly-made elements. Some XBL thing.
var searchIn = extPrefs.getPrefType("searchIn") ? extPrefs.getCharPref("searchIn")
	: "folderAndSubfolders";
if (searchIn != "any") {
	var menuItem = document.createElement("menuitem");
	menuItem.id = "RandomBookmarkFromFolder";
	menuItem.setAttribute("label", l10n.get("menuItem"));
	menuItem.setAttribute("oncommand", "RandomBookmarkFromFolder.go(event, '" + searchIn + "')");
	finalPreparation(menuItem);
} else {
	var menuItem1 = document.createElement("menuitem");
	menuItem1.id = "RandomBookmarkFromFolder1";
	menuItem1.setAttribute("label", l10n.get("menuItemFolderOnly"));
	menuItem1.setAttribute("oncommand", "RandomBookmarkFromFolder.go(event, 'folder')");
	finalPreparation(menuItem1);
	var menuItem2 = document.createElement("menuitem");
	menuItem2.id = "RandomBookmarkFromFolder2";
	menuItem2.setAttribute("label", l10n.get("menuItemFolderAndSubfolders"));
	menuItem2.setAttribute("oncommand", "RandomBookmarkFromFolder.go(event, 'folderAndSubfolders')");
	finalPreparation(menuItem2);
}
function finalPreparation(menuItem) {
	menuItem.setAttribute("selectiontype", "single");
	menuItem.setAttribute("selection", "folder");
	menuItem.setAttribute("forcehideselection", "livemark/feedURI");
	menuItem.setAttribute("onclick", "checkForMiddleClick(this, event)");
	menuItem.setAttribute("class", "menuitem-iconic");
	menuItem.setAttribute("image", "chrome://RandomBookmarkFromFolder/content/MenuIcon.png");
	document.getElementById("placesContext").appendChild(menuItem);
	cleanupTasks.push( removalTask(menuItem) );
}

RandomBookmarkFromFolder.go = function(event, searchSpace) {
	try {
		var folderID = PlacesUIUtils.getViewForNode(document.popupNode).selectedNode.itemId;
		folderQuery.setFolders([folderID], 1);
		var folder = places.executeQuery(folderQuery, defaultOptions).root;
		var bookmarks = getBookmarks(folder, searchSpace);
		if (bookmarks.length == 0) {
			Services.prompt.alert(window, l10n.get("extName"), l10n.get("errNoBookmarks"));
			return;
		}
		var chosen = bookmarks[ Math.floor( Math.random() * bookmarks.length ) ];
		openUILinkIn(chosen.uri, whereToOpenLink(event));
	} catch(e) {
		console.error(e);
		Services.prompt.alert(window, l10n.get("extName"), l10n.get("errGeneric"));
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

var prefsObserver = { observe: function() {
	RandomBookmarkFromFolder.cleanUp();
	setup();
} };
extPrefs.addObserver("", prefsObserver, false);
cleanupTasks.push( function() {
	extPrefs.removeObserver("", prefsObserver);
} );

RandomBookmarkFromFolder.cleanUp = function() {
	cleanupTasks.forEach( function(task) { task(); } );
};

})();
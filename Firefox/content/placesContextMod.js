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
	menuItem1.addEventListener("command", fulfillPurpose.bind("folder"));
	finalPreparation(menuItem1);
	var menuItem2 = document.createElement("menuitem");
	menuItem2.id = "RandomBookmarkFromFolder2";
	menuItem2.setAttribute("label", l10n.get("menuItemFolderAndSubfolders"));
	menuItem2.addEventListener("command", fulfillPurpose.bind("folderAndSubfolders"));
	finalPreparation(menuItem2);
}
function finalPreparation(menuItem) {
	menuItem.setAttribute("selectiontype", "single");
	menuItem.setAttribute("selection", "folder");
	document.getElementById("placesContext").appendChild(menuItem);
	cleanupTasks.push( removalTask(menuItem) );
}

function fulfillPurpose(searchSpace, event) {
}

extPrefs.addObserver("", { observe: function() {
	cleanUpRandomBookmarkFromFolder();
	setup();
} }, false);

window.cleanUpRandomBookmarkFromFolder = function() {
	cleanupTasks.forEach( function(task) { task(); } );
};

})();
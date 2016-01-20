"use strict";
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://services-common/stringbundle.js");
var windowWatcher = Services.ww;
var onWindowEvent = {observe: function(window, eventType) {
	if (eventType == "domwindowopened") { foundWindow(window); }
} };
var onOptionsDisplayed = {observe: function(subject, topic, data) {
	if (data == "randombookmark@pikadudeno1.com") {
		let l10n = new StringBundle("chrome://RandomBookmarkFromFolder/locale/messages.properties");
		for (let element of subject.querySelectorAll("[l10n]")) {
			let l10nAttr = element.tagName == "radio" ? "label" : "title";
			element.setAttribute( l10nAttr, l10n.get(element.getAttribute("l10n")) );
		}
	}
} };
function windows() {
	var winEnum = windowWatcher.getWindowEnumerator();
	while (winEnum.hasMoreElements()) {
		yield winEnum.getNext();
	}
}
function startup() {
	windowWatcher.registerNotification(onWindowEvent);
	for (let window of windows()) {
		foundWindow(window);
	}
	Services.obs.addObserver(onOptionsDisplayed, "addon-options-displayed", false);
}
function foundWindow(window) {
	window = window.QueryInterface(Components.interfaces.nsIDOMWindow);
	if (window.document.readyState != "complete") {
		window.addEventListener("load", loadedWindow, true);
		return;
	}
	if (window.document.getElementById("placesContext") == null) { return; }
	Services.scriptloader.loadSubScript("chrome://RandomBookmarkFromFolder/content/placesContextMod.js", window);
}
function loadedWindow() {
	foundWindow(this);
}
function shutdown() {
	windowWatcher.unregisterNotification(onWindowEvent);
	Services.obs.removeObserver(onOptionsDisplayed, "addon-options-displayed");
	for (let window of windows()) {
		window = window.QueryInterface(Components.interfaces.nsIDOMWindow);
		window.removeEventListener("load", loadedWindow, true);
		if (window.RandomBookmarkFromFolder) {
			window.RandomBookmarkFromFolder.cleanUp();
		}
	}
}
function uninstall(data, reason) {
	// Guarantee that if a new version is installed, it has the new strings
	// https://bugzilla.mozilla.org/show_bug.cgi?id=719376
	Services.strings.flushBundles();
	
	if (reason == ADDON_UNINSTALL) {
		Services.prefs.getBranch("extensions.RandomBookmarkFromFolder.").deleteBranch("");
	}
}
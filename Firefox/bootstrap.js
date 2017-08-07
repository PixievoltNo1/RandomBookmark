"use strict";
Components.utils.import("resource://gre/modules/Services.jsm");
var windowWatcher = Services.ww;
var onWindowEvent = {observe: function(window, eventType) {
	if (eventType == "domwindowopened") { foundWindow(window); }
} };
var searchPref, webExtPort;
var onOptionsDisplayed = {observe: function(subject, topic, data) {
	if (data == "randombookmark@pikadudeno1.com") {
		let l10n = Services.strings.createBundle("chrome://RandomBookmarkFromFolder/locale/messages.properties");
		for (let element of subject.querySelectorAll("[l10n]")) {
			let l10nAttr = element.tagName == "radio" ? "label" : "title";
			element.setAttribute( l10nAttr, l10n.GetStringFromName(element.getAttribute("l10n")) );
			if (element.hasAttribute("value")) {
				if (element.getAttribute("value") == searchPref) {
					element.radioGroup.selectedItem = element;
				}
				element.addEventListener("command", () => {
					prefChange(element.getAttribute("value"));
				});
			}
		}
	}
} };
function windows() {
	var winEnum = windowWatcher.getWindowEnumerator();
	while (winEnum.hasMoreElements()) {
		yield winEnum.getNext();
	}
}
function startup({webExtension}) {
	webExtension.startup().then(({browser: {runtime}}) => {
		runtime.onConnect.addListener((port) => {
			webExtPort = port;
			var checkBranch = Services.prefs.getBranch("extensions.RandomBookmarkFromFolder.");
			if (checkBranch.prefHasUserValue("searchIn")) {
				searchPref = checkBranch.getCharPref("searchIn");
				webExtPort.postMessage({newSearchPref: searchPref});
				checkBranch.deleteBranch("");
				webExtReady();
			} else {
				port.onMessage.addListener((prefs) => {
					searchPref = prefs.searchPref;
					webExtReady();
				})
			}
		});
	});
}
function webExtReady() {
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
	Services.scriptloader.loadSubScriptWithOptions("chrome://RandomBookmarkFromFolder/content/placesContextMod.js", {
		target: window,
		charset: "UTF-8",
		ignoreCache: true
	});
	window.RandomBookmarkFromFolder.setup(searchPref);
}
function loadedWindow() {
	foundWindow(this);
}
function prefChange(newPref) {
	searchPref = newPref;
	for (let window of windows()) {
		if (window.RandomBookmarkFromFolder) {
			window.RandomBookmarkFromFolder.setup(searchPref);
		}
	}
	webExtPort.postMessage({newSearchPref: searchPref});
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
}
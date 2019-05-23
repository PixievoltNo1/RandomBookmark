chrome.runtime.onInstalled.addListener(async function({reason}) {
	if (reason != "update") { return; }
	var {searchIn: oldSearchIn = false} = await new Promise(
		(resolve) => { chrome.storage.local.get("searchIn", resolve) } );
	if (oldSearchIn) {
		var newPrefs = ({
			folderAndSubfolders: { searchIn: "folderAndSubfolders", showAndSubfolders: false },
			folder: { searchIn: "folderOnly", showAndSubfolders: false },
			any: { searchIn: "folderOnly", showAndSubfolders: true },
		})[oldSearchIn];
		chrome.storage.sync.set(newPrefs);
		chrome.storage.local.clear();
	}
});

// Check for Firefox 52 ESR's webextensions.storage.sync.enabled set to false
chrome.runtime.onStartup.addListener(function() {
	chrome.storage.sync.get("test", function() {
		console.log("sync error", chrome.runtime.lastError);
		if (false /* check for a specific lastError */) {
			// TODO: Open tab explaining the problem
			let browserActionListener = () => {
				// TODO: Open the same page as above
			};
			chrome.browserAction.setPopup("");
			chrome.browserAction.onClicked.addListener(browserActionListener);
			// TODO: Listen for an "all-clear" message and undo the above
		}
	});
});

if (browser && browser.menus && Object.values(browser.menus.ContextType).includes("bookmark")) {
	import("./contextMenu.module.js");
}
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

chrome.alarms.onAlarm.addListener( ({name}) => {
	if (name == "clearCache") {
		indexedDB.deleteDatabase("cache");
	}
} );

if (browser && browser.menus && Object.values(browser.menus.ContextType).includes("bookmark")) {
	import("./contextMenu.module.js");
}
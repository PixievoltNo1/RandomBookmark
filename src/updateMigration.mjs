chrome.runtime.onInstalled.addListener(async function({reason}) {
	if (reason != "update") { return; }

	// 1.x: Migrate preference
	var {searchIn: oldSearchIn = false} = chrome.storage.local.get("searchIn");
	if (oldSearchIn) {
		var newPrefs = ({
			folderAndSubfolders: { searchIn: "folderAndSubfolders", showAndSubfolders: false },
			folder: { searchIn: "folderOnly", showAndSubfolders: false },
			any: { searchIn: "folderOnly", showAndSubfolders: true },
		})[oldSearchIn];
		chrome.storage.sync.set(newPrefs);
		chrome.storage.local.clear();
	}
	// 2.1-2.2: Ensure Firefox doesn't keep indexedDB cache
	indexedDB.deleteDatabase("cache");
});
if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }

// Workaround for Chrome only supporting SVG files when they're specified by setIcon
chrome.browserAction.setIcon({path:
	chrome.runtime.getManifest().browser_action.default_icon
});

chrome.runtime.onInstalled.addListener(async function({reason}) {
	if (reason != "update") { return; }
	var {searchIn: oldSearchIn = false} = await new Promise(
		(resolve) => { chrome.storage.local.get("searchIn", resolve) } );
	if (oldSearchIn) {
		if (oldSearchIn == "any") {
			var newPrefs = { searchIn: "folder", showAndSubfolders: true };
		} else {
			var newPrefs = { searchIn: oldSearchIn, showAndSubfolders: false };
		}
		chrome.storage.sync.set(newPrefs);
		chrome.storage.local.clear();
	}
});
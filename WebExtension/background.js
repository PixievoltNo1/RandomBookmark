if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }

// Workaround for Chrome only supporting SVG files when they're specified by setIcon
chrome.browserAction.setIcon({path:
	chrome.runtime.getManifest().browser_action.default_icon
});

/* TODO: If searchIn is in storage.local, translate it to new prefs in storage.sync:
	searchIn == "any":
		searchIn = "folder"
		showAndSubfolders = true
	else:
		searchIn = old value
		showAndSubfolders = false
*/
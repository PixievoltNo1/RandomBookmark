import chooseBookmark from "./bookmarkSelection.esm.js";

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

chrome.runtime.onInstalled.addListener( () => {
	indexedDB.deleteDatabase("cache");
} );
chrome.runtime.onStartup.addListener( () => {
	indexedDB.deleteDatabase("cache");
} );
chrome.alarms.onAlarm.addListener( ({name}) => {
	if (name == "clearCache") {
		indexedDB.deleteDatabase("cache");
	}
} );

chrome.runtime.onMessage.addListener( async ({name, ...details}) => {
	if (name == "pickBookmark") {
		let {folderId, useSubfolders} = details;
		await pickBookmark(folderId, useSubfolders);
	} else if (name == "errorPage") {
		let {tabId, errorName, errorDetails = []} = details;
		errorPage(tabId, errorName, ...errorDetails);
	}
} );

function errorPage(tabId, errorName, ...details) {
	// TODO: Show the error
}
// TODO: Make an extension page to use in place of about:blank
const PICK_IN_PROGRESS_PAGE = "about:blank";
async function pickBookmark(folderId, useSubfolders) {
	let {openInNewTab = true} = await chrome.storage.get("openInNewTab");
	let tab, folder, bookmark;
	if (openInNewTab) {
		tab = await chrome.tabs.create({url: PICK_IN_PROGRESS_PAGE});
	} else {
		tab = (await chrome.tabs.query({active: true}))[0];
		chrome.tabs.update(tab.id, PICK_IN_PROGRESS_PAGE);
	}
	try {
		[folder] = await chrome.bookmarks.getSubTree(folderId)
			.catch( () => { throw ["folder not found"]; } );
		bookmark = chooseBookmark(folder, useSubfolders);
		if (!bookmark) { throw ["no bookmarks"]; }
		await chrome.tabs.update(tab.id, {url: bookmark.url})
			.catch( () => { throw ["opening not allowed", bookmark.url]; } );
	} catch (o_o) {
		errorPage(tab.id, ...error);
	}
}
import chooseBookmark from "./bookmarkSelection.mjs";
import "./updateMigration.mjs";
import { cacheClear } from "./cacheAccess.mjs";

chrome.runtime.onInstalled.addListener( () => {
	cacheClear();
} );
chrome.runtime.onStartup.addListener( () => {
	cacheClear();
} );
chrome.alarms.onAlarm.addListener( ({name}) => {
	if (name == "clearCache") {
		cacheClear();
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
	let searchParams = new URLSearchParams({errorName});
	for (let detail of details) {
		searchParams.append("detail", detail);
	}
	chrome.tabs.update(tabId, {url: `/infoPages/error.html?${searchParams}`});
}
const PICK_IN_PROGRESS_PAGE = "/infoPages/picking.html";
async function pickBookmark(folderId, useSubfolders, updateLastPick = true) {
	let {openInNewTab = true} = await chrome.storage.sync.get("openInNewTab");
	let tab;
	if (openInNewTab) {
		tab = await chrome.tabs.create({url: PICK_IN_PROGRESS_PAGE});
	} else {
		tab = (await chrome.tabs.query({active: true}))[0];
		chrome.tabs.update(tab.id, {url: PICK_IN_PROGRESS_PAGE});
	}
	try {
		let fetch = chrome.bookmarks[useSubfolders ? "getSubTree" : "getChildren"](folderId)
			.catch( () => { throw ["folderNotFound"]; } );
		let folderChildren = useSubfolders ? (await fetch)[0].children : (await fetch);
		let bookmark = chooseBookmark(folderChildren, useSubfolders);
		if (!bookmark) { throw ["noBookmarks"]; }
		if (updateLastPick) {
			await chrome.storage.local.set({
				lastPickFolderId: folderId,
				lastPickSubfolders: useSubfolders,
			}).catch( console.error );
		}
		await chrome.tabs.update(tab.id, {url: bookmark.url})
			.catch( () => { throw ["openingNotAllowed", bookmark.url]; } );
	} catch (o_o) {
		if (!Array.isArray(o_o)) { throw o_o; }
		errorPage(tab.id, ...o_o);
	}
}

chrome.commands.onCommand.addListener( async (command) => {
	if (command == "repeat_pick") { repeatLastPick(); }
});
async function repeatLastPick() {
	let [lastPick, prefs] = await Promise.all([
		chrome.storage.local.get(["lastPickFolderId", "lastPickSubfolders"]),
		chrome.storage.sync.get({searchIn: "folderAndSubfolders", showAndSubfolders: false}),
	]);
	// If there's no last pick, let pickBookmark show a "folder not found" error
	let folderId = lastPick.lastPickFolderId ?? "";
	let useSubfolders = prefs.showAndSubfolders
		? lastPick.lastPickSubfolders
		: prefs.searchIn == "folderAndSubfolders";
	pickBookmark(folderId, useSubfolders, false);
}
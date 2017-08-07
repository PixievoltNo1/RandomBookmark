"use strict";
var port = chrome.runtime.connect();
chrome.storage.local.get({searchIn: "folderAndSubfolders"}, ({searchIn}) => {
	port.postMessage({searchPref: searchIn});
});
port.onMessage.addListener(({newSearchPref}) => {
	chrome.storage.local.set({searchIn: newSearchPref});
});
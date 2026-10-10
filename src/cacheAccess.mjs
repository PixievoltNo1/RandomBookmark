import { set as idbSet, get as idbGet, createStore as idbCreateStore } from "idb-keyval";
import { getBrowserType } from "./sniffBrowser.mjs";

export var cacheGet, cacheSet, cacheClear;

if (getBrowserType() != "Firefox") {
	let store = idbCreateStore("cache", "keyval");
	cacheGet = (key) => idbGet(key, store);
	cacheSet = (key, value) => idbSet(key, value, store);
	cacheClear = () => indexedDB.deleteDatabase("cache");
} else {
	// Firefox as of v157 does not reliably provide indexedDB, but browser.storage.local is based on
	// indexedDB and can store the same values. https://bugzilla.mozilla.org/show_bug.cgi?id=1893821
	const PREFIX = "cache-";
	cacheGet = async (key) => (await browser.storage.local.get(PREFIX + key))[PREFIX + key];
	cacheSet = (key, value) => browser.storage.local.set({[PREFIX + key]: value});
	cacheClear = async () => {
		let keys = await browser.storage.local.getKeys();
		keys = keys.filter( (key) => key.startsWith(PREFIX) );
		return browser.storage.local.remove(keys);
	}
}
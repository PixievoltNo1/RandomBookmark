import webextStorageAdapter from "svelte-webext-storage-adapter";
import writableDerived from "svelte-writable-derived";
var { stores, ready } = webextStorageAdapter({
	pins: [],
	searchIn: "folderAndSubfolders",
	showAndSubfolders: false,
});
var exportedStores = Object.assign({}, stores, {
	pins: writableDerived(
		stores.pins,
		(pinsArray) => { return new Set(pinsArray); },
		(pinsSet) => { return [...pinsSet]; },
	),
});
export { exportedStores as default, exportedStores as stores, ready };
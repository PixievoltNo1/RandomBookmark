import { writable } from "svelte/store";
var store = writable(chrome.i18n.getMessage);
export default { subscribe: store.subscribe };
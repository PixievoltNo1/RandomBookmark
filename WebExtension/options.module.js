if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }
import storePersist from './storePersist.module.js';
import StandaloneOptions from './svelteComponents/StandaloneOptions.html';
import Options from './svelteComponents/Options.html';
import { Store } from 'svelte/store';

var store = new Store({
	l10n: chrome.i18n.getMessage,
});
storePersist(store, ["searchIn", "showAndSubfolders"]);
var pageComponent = (location.hash == "#standalone") ? StandaloneOptions : Options;
new pageComponent({
	target: document.body,
	store
});
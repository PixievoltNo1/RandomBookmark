if (!(window.chrome && chrome.runtime)) { window.chrome = browser; }
import prefSpec from './prefSpec.module.js';
export default async function(store, prefs = Object.keys(prefSpec)) {
	var request = {}, wakes = new Map(), sleeps = new Map();
	for (let key of prefs) {
		let {default: def, wake = false, sleep = false} = prefSpec[key];
		request[key] = def;
		if (wake) { wakes.set(key, wake); }
		if (sleep) { sleeps.set(key, sleep); }
	}
	var data = await new Promise((resolve) => { chrome.storage.sync.get(request, resolve) });
	for (let [key, wake] of wakes.entries()) {
		data[key] = wake(data[key]);
	}
	store.set(data);
	for (let key of prefs) {
		store.observe(key, (data) => {
			if (sleeps.has(key)) { data = sleeps.get(key)(data); }
			chrome.storage.sync.set({[key]: data});
		}, { init: false });
	}
	return true;
}
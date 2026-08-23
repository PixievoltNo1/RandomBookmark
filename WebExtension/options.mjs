import Options from './svelte/Options.svelte';
import { ready } from './storage.mjs';

ready.then( () => {
	new Options({ target: document.body });
} );
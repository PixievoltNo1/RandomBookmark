import Options from './svelte/Options.svelte';
import { ready } from './storage.esm.js';

ready.then( () => {
	new Options({ target: document.body });
} );
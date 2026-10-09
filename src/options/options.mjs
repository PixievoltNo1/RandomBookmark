import { mount } from 'svelte';
import Options from './Options.svelte';
import { ready } from '../storage.mjs';

ready.then( () => {
	new mount(Options, { target: document.body });
} );
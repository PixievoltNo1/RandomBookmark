<script context="module">
import l10n from "../l10nStore.esm.js";
import storage from "../storage.esm.js";
import { getContext } from "svelte";
import { derived } from "svelte/store";
import { onChosen, onTogglePin } from "../ui.esm.js";
import FolderNodeList from "./FolderNodeList.svelte";

var l10nCached = derived(l10n, ($l10n) => {
	return {
		andSubfolders: $l10n("andSubfolders"),
		pin: $l10n("pin"),
	};
});
</script>

<script>
export let id, title, list, hasChildBookmarks, hasDescendantBookmarks;
let showSubfolders = false, showKeyHelp = false;
let focusMe;
let tree = getContext("tree");
var { searchIn, showAndSubfolders, pins } = storage;
$: searchSubfolders = $searchIn == "folderAndSubfolders";
$: pinned = $pins.has(id);
$: enabled = searchSubfolders ? hasDescendantBookmarks : hasChildBookmarks;

function keyboardInteraction(event) {
	var {ctrlKey, key} = event;
	if (key == "Enter") {
		let andSubfolders = searchSubfolders || ( $showAndSubfolders && ctrlKey );
		onChosen({id, andSubfolders});
	} else if (ctrlKey && key == "p") {
		onTogglePin(id, !pinned);
		event.preventDefault();
	}
}

export let siblings, pos, parent;
let active;
let me = {
	expand() {
		if (list.length) {
			showSubfolders = true;
		}
	},
	collapse() {
		showSubfolders = false;
	},
	focus() {
		focusMe.focus();
	},
	setActive(to) {
		active = to;
	},
	id,
};
$: {
	me.siblings = siblings;
	me.pos = pos;
	me.parent = parent;
	siblings[pos] = me;
}
let navigables;
$: me.children = showSubfolders ? navigables : null;
function focused(event) {
	tree.setActiveNavNode(me);
	event.stopPropagation();
}
</script>

<li class="folderNode" on:keydown={keyboardInteraction} on:focusin={focused}
	role="treeitem" aria-expanded="{list.length ? showSubfolders : 'undefined'}">
	<div class="selIndicator" tabindex="{active ? 0 : -1}" bind:this={focusMe}
		 on:focus="{ () => { showKeyHelp = true; } }" on:blur="{ () => { showKeyHelp = false; } }"/>
	{#if list.length}
		<button type="button" tabindex="-1" class="expander" class:expanded={showSubfolders}
			on:click="{ () => { showSubfolders = !showSubfolders } }"></button>
	{/if}
	<button type="button" tabindex="-1" class="folderName" disabled="{!enabled}"
		on:click="{ () => { onChosen({id, andSubfolders: searchSubfolders}); } }">{title}</button>
	{#if list.length && $showAndSubfolders}
		<button type="button" tabindex="-1" class="andSubfolders" disabled="{!hasDescendantBookmarks}"
			on:click="{ () => { onChosen({id, andSubfolders: true}); } }">
			{$l10nCached.andSubfolders}
			{#if showKeyHelp}
				<span class="keyboardHelp">{$l10n("ctrlEnter")}</span>
			{/if}
		</button>
	{/if}
	<button type="button" tabindex="-1" class="pin" class:pinned
		aria-label="{$l10nCached.pin}" aria-pressed="{pinned}"
		on:click="{ () => { onTogglePin(id, !pinned); } }">
		{#if showKeyHelp}
			<span class="keyboardHelp">ctrl+P</span>
		{/if}
	</button>
	{#if showSubfolders}
		<ul class="subfolders" role="group">
			<FolderNodeList {list} owner={me} bind:navigables/>
		</ul>
	{/if}
</li>
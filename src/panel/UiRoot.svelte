<script context="module">
const PIN_IMG = "/images/iconmonstr-pin-1.svg";
</script>
<script>
import l10n from "../l10nStore.mjs";
import { ready } from "../storage.mjs";
import FolderTree from './FolderTree.svelte';
import Options from '../options/Options.svelte';
import { bookmarksReady, cleanPins } from "./ui.mjs";

let folderList, pinList;
export function updateLists({folderList: newFolderList, pinList: newPinList}) {
	if (newFolderList) { folderList = newFolderList; }
	if (newPinList) { pinList = newPinList; }
}
let pinsDirty = false;
export function pinsDirtied() { pinsDirty = true; }
let missingPins;
export function updateMissingPins(newMissingPins) { missingPins = newMissingPins; }
$: pinHelpParts = $l10n("pinHelp").split("<pin>").map( (str) => { return str.trim(); } );

var optionsEnabled = false;
ready.then( () => { optionsEnabled = true; } );
var showOptions = false;
</script>

<svelte:head>
	<title>{$l10n("extName")}</title>
</svelte:head>
<div id="flexContainer">
<div id="menu">
	<h1>
		{$l10n("pinHeader")}
		{#if pinsDirty}
			<div class="headerExtra" id="pinsOutdated">{$l10n("pinsOutdated")}</div>
		{/if}
	</h1>
	{#if pinList && !pinList.length}
		<div id="noPins">
			{pinHelpParts[0]}
			<img src={PIN_IMG} width="18" height="18" alt="{$l10n('pin')}">
			{pinHelpParts[1]}
		</div>
	{:else if pinList}
		<FolderTree list="{pinList}"/>
	{/if}
	{#if missingPins && missingPins.size}
		<div id="missingPins">
			{$l10n("missingPins", [missingPins.size])}
			<button type="button" id="cleanPins" on:click="{ () => cleanPins(missingPins) }">
				{$l10n("cleanPins")}
			</button>
		</div>
	{/if}
	<h1>
		{$l10n("allFoldersHeader")}
		{#if folderList && !$bookmarksReady}
			<div class="headerExtra refreshing">{$l10n("refreshing")}</div>
		{/if}
	</h1>
	{#if !folderList}
		<div class="loading">{$l10n("loading")}</div>
	{:else}
		<FolderTree list="{folderList}" openTopLevel={true}/>
	{/if}
</div>
<div id="optionsPane">
	<button type="button" class="optionsExpander" class:expanded={showOptions}
		on:click="{ () => { showOptions = !showOptions; } }" disabled="{!optionsEnabled}"
		aria-expanded="{showOptions}">
		{$l10n(showOptions ? "closeOptions" : "showOptions")}
	</button>
	{#if showOptions}<div id="optionsArea"><Options/></div>{/if}
</div>
</div>
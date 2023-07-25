<script context="module">
const PIN_IMG = String(new URL("../images/iconmonstr-pin-1.svg", import.meta.url));
</script>
<script>
import l10n from "../l10nStore.esm.js";
import { ready } from "../storage.esm.js";
import FolderTree from './FolderTree.svelte';
import Options from './Options.svelte';
import { bookmarksReady, cleanPins } from "../ui.esm.js";

export let folderList, pinList;
export let folderListAutoNav;
export let pinsDirty = false, missingPins;
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
		<FolderTree list="{folderList}" autoNav={folderListAutoNav}/>
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
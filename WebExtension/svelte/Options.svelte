<script>
import l10n from "../l10nStore.esm.js";
import storage from "../storage.esm.js";

var { searchIn, showAndSubfolders, openInNewTab } = storage;
$: if ($searchIn != "folderOnly") {
	$showAndSubfolders = false;
}
</script>

<ul class="optionsGroup">
	<li><label>
		<input type="radio" name="searchIn" value="folderAndSubfolders" bind:group="{$searchIn}">
		{$l10n("searchInFolderAndSubfolders")}
	</label></li>
	<li>
		<label>
			<input type="radio" name="searchIn" value="folderOnly" bind:group="{$searchIn}">
			{$l10n("searchInFolderOnly")}
		</label>
		<ul>
			<li><label>
				<input type="checkbox" disabled="{$searchIn != 'folderOnly'}" bind:checked="{$showAndSubfolders}">
				{$l10n("showAndSubfolders")}
			</label></li>
		</ul>
	</li>
</ul>
<div class="optionsGroup">
	<label>
		<input type="checkbox" bind:checked="{$openInNewTab}">
		{$l10n("openInNewTab")}
	</label>
</div>
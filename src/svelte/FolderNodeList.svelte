<script>
import FolderNode from "./FolderNode.svelte";
export let list, owner, navigables;
let navigableIndexes;
$: list, processList();
function processList() {
	navigables = [], navigableIndexes = new Map();
	for (let item of list) {
		if (item.separator) { continue; }
		navigableIndexes.set(item.id, navigables.length);
		navigables.push(null);
	}
}
</script>

{#each list as item}
	{#if item.separator}
		<ul class="separator" role="separator"></ul>
	{:else}
		<FolderNode {...item} siblings={navigables} pos={navigableIndexes.get(item.id)}
			parent={owner}/>
	{/if}
{/each}

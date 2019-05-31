<script>
import FolderNodeList from "./FolderNodeList.svelte";
import { onMount, setContext } from "svelte";
let activeNavNode, navTree;
export let list, autoNav;
function navigate(event) {
	var {key} = event;
	var destination;
	if (key == "ArrowUp") {
		if (activeNavNode.pos == 0) {
			destination = activeNavNode.parent; // may be null
		} else {
			// Select the previous sibling's last available list item
			destination = activeNavNode.siblings[ activeNavNode.pos - 1 ];
			while (destination.children) {
				destination = destination.children[ destination.children.length - 1 ];
			}
		}
	} else if (key == "ArrowDown") {
		if (activeNavNode.children) {
			destination = activeNavNode.children[0];
		} else {
			let moveFrom = activeNavNode;
			while (moveFrom.pos == moveFrom.siblings.length - 1) {
				moveFrom = moveFrom.parent;
				if (!moveFrom) {
					// activeNavNode is the root's last available list item. Abort navigation.
					return;
				}
			}
			destination = moveFrom.siblings[ moveFrom.pos + 1 ];
		}
	} else if (key == "ArrowLeft") {
		if (activeNavNode.children) {
			activeNavNode.collapse();
		} else {
			destination = activeNavNode.parent; // may be null
		}
	} else if (key == "ArrowRight") {
		if (!activeNavNode.children) {
			activeNavNode.expand();
		} else {
			destination = activeNavNode.children[0];
		}
	} else if (key == "Home") {
		destination = navTree[0];
	} else if (key == "End") {
		destination = navTree[ navTree.length - 1 ];
		while (destination.children) {
			destination = destination.children[ destination.children.length - 1 ];
		}
	}
	if (destination) {
		event.preventDefault();
		destination.focus();
	}
}
onMount( () => {
	setActiveNavNode(navTree[0]);
	if (autoNav) { autoNav(navTree); }
} );
setContext("tree", {
	setActiveNavNode,
});
function setActiveNavNode(newActiveNavNode) {
	if (activeNavNode) {
		activeNavNode.setActive(false);
	}
	newActiveNavNode.setActive(true);
	activeNavNode = newActiveNavNode;
}
</script>

<ul on:keydown={navigate} role="tree">
	<FolderNodeList {list} bind:navigables={navTree}/>
</ul>
export default function chooseBookmark(from, useSubfolders) {
	var bookmarks = [];
	(function readChildren(folder) {
		for (let node of folder.children) {
			if (node.children) {
				if (useSubfolders) {
					readChildren(node);
				}
			} else if (node.url) {
				bookmarks.push(node);
			}
		}
	})(from);
	return bookmarks[ Math.floor( Math.random() * bookmarks.length ) ];
}
/**
 * @param {chrome.bookmarks.BookmarkTreeNode[]} fromChildren
 * @param {boolean} useSubfolders
 * @returns {chrome.bookmarks.BookmarkTreeNode | undefined}
 */
export default function chooseBookmark(fromChildren, useSubfolders) {
	var bookmarks = [];
	(function readChildren(children) {
		for (let node of children) {
			if (node.children) {
				if (useSubfolders) {
					readChildren(node.children);
				}
			} else if (node.url) {
				bookmarks.push(node);
			}
		}
	})(fromChildren);
	return bookmarks[ Math.floor( Math.random() * bookmarks.length ) ];
}
export default {
	pins: {
		default: [],
		wake(pinArr) {
			return new Set(pinArr);
		},
		sleep(pinSet) {
			return [...pinSet];
		}
	},
	searchIn: { default: "folderAndSubfolders" },
	showAndSubfolders: { default: false }
};
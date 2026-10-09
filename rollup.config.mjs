import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import copy from "@guanghechen/rollup-plugin-copy";
import path from "node:path";
const NODE_MODULES_PATH = path.resolve("node_modules");
export default function() {
	/** @type import('rollup').RollupOptions */
	let options = {
		input: [
			"src/background.mjs",
			"src/ui.mjs",
			"src/options.mjs",
			"src/infoPage.mjs",
		],
		plugins: [
			svelte(),
			resolve({browser: true}),
			copy({ targets: [
				{
					src: "src/{_locales,icon,images,*.html,*.json}",
					dest: `build`,
					rename: (name, ext, srcPath) => path.relative("src", srcPath),
				},
			] }),
		],
		onwarn(log, handler) {
			if (log.code == "CIRCULAR_DEPENDENCY" && log.ids[0].startsWith(NODE_MODULES_PATH)) {
				return;
			}
			handler(log);
		},
		output: {
			dir: `build`,
			assetFileNames: "[name][extname]",
			sourcemap: true,
		},
	};
	return options;
}
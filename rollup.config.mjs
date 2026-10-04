import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import copy from "@guanghechen/rollup-plugin-copy";
import command from "rollup-plugin-command";
import path from "node:path";
export default function({sourcemap = true, watch}) {
	/** @type import('rollup').RollupOptions */
	let options = {
		input: [
			"WebExtension/background.mjs",
			"WebExtension/ui.mjs",
			"WebExtension/options.mjs",
			"WebExtension/infoPage.mjs",
		],
		plugins: [
			svelte(),
			resolve({browser: true}),
			copy({ targets: [
				{
					src: "WebExtension/{_locales,icon,images,*.html,*.json}",
					dest: `build`,
					rename: (name, ext, srcPath) => path.relative("WebExtension", srcPath),
				},
			] }),
			command(
				`sass --color WebExtension:build`
					+ `${watch ? " --watch" : ""}${sourcemap ? "" : " --no-source-map"}`,
				{ once: true, exitOnFail: true },
			),
		],
		output: {
			dir: `build`,
			assetFileNames: "[name][extname]",
			sourcemap,
		},
	};
	return options;
}
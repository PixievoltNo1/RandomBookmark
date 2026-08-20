import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import copy from "@guanghechen/rollup-plugin-copy";
import styler from "rollup-plugin-styler";
import path from "node:path";
export default function({sourcemap = true, configOnlyBuild = false}) {
	/** @type import('rollup').RollupOptions */
	let options = {
		input: [
			"WebExtension/background.mjs",
			"WebExtension/ui.esm.js",
			"WebExtension/stylesheet.scss",
			"WebExtension/options.esm.js",
			"WebExtension/options.scss",
		],
		plugins: [
			styler({
				mode: "extract",
				url: false,
				sourceMap: sourcemap,
			}),
			svelte(),
			resolve({browser: true}),
		],
		output: [],
	};
	function addBuildOptions(buildName) {
		options.output.push({
			dir: `build-${buildName}`,
			assetFileNames: "[name][extname]",
			sourcemap,
		});
		options.plugins.push( copy({
			targets: [
				{
					src: "WebExtension/{_locales,icon,images,*.html}",
					dest: `build-${buildName}`,
					rename: (name, ext, srcPath) => path.relative("WebExtension", srcPath),
				},
				{
					src: `WebExtension/manifest.${buildName}.json`,
					rename: "manifest.json",
					dest: `build-${buildName}`,
				},
			],
		}) );
	}
	if (configOnlyBuild) {
		addBuildOptions(configOnlyBuild);
	} else {
		addBuildOptions("firefox");
		addBuildOptions("chrome");
	}
	return options;
}
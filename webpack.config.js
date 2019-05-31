var webpack = require('webpack');
var path = require('path');
var fileUrl = require('file-url');

module.exports = function(env = {}) { return {
	entry: {
		ui: './WebExtension/ui.esm.js',
		options: './WebExtension/options.esm.js'
	},
	output: {
		path: path.resolve(__dirname, env.release ? 'release/build' : 'WebExtension/build'),
		filename: '[name].js'
	},
	// Firefox & Chrome don't correctly handle relative URLs for source maps in extensions. Workaround is in plugins.
	// devtool: "source-maps",
	module: {
		rules: [
			{
				test: /\.svelte/,
				use: {
					loader: "svelte-loader",
				}
			},
		],
	},
	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: "common",
		}),
		// Workaround for above Firefox/Chrome issue
		...( env.release ? [] : [
			new webpack.SourceMapDevToolPlugin({
				publicPath: fileUrl("WebExtension/build") + "/",
				filename: "[file].map"
			}),
		] )
	],
}; };

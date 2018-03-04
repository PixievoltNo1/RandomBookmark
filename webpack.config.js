var webpack = require('webpack');
var path = require('path');
var fileUrl = require('file-url');

// TODO: Write alternate configuration for extension store releases
module.exports = function(env = {}) { return {
	entry: {
		ui: './WebExtension/ui.module.js',
		options: './WebExtension/options.module.js'
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
				test: /\.html$/,
				use: {
					loader: "svelte-loader",
					options: {
						store: true,
					}
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
	stats: {
		optimizationBailout: true,
	},
}; };

var webpack = require('webpack');
var path = require('path');
var fileUrl = require('file-url');

// TODO: Write alternate configuration for extension store releases
module.exports = {
	entry: './WebExtension/ui.module.js',
	output: {
		path: path.resolve(__dirname, 'WebExtension'),
		filename: 'ui.bundle.js'
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
		// Workaround for above Firefox/Chrome issue
		new webpack.SourceMapDevToolPlugin({
			publicPath: fileUrl("WebExtension") + "/",
			filename: "sourcemaps/[file].map"
		})
	],
	stats: {
		optimizationBailout: true,
	},
};

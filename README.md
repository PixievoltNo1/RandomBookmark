# Random Bookmark From Folder

This [WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions), made for Firefox, Chrome, & Edge, lets you select a bookmark folder and open a bookmark at random from it. It's made with an eye for customizability and good UX.

Links to install the stable version will be available soon.

# Writing & testing Random Bookmark From Folder

This project has a build process employing [ES6 modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/) (*.module.js), [Svelte](https://svelte.technology/) templates (svelteComponents/*.html), and [Sass](http://sass-lang.com/) files (*.scss) to generate JavaScript and CSS. With [Node](https://nodejs.org/) installed, run this command the first time you obtain this repo's files to fetch everything you need:

```
npm install
```

With that done, keep the following command running as you work. It'll generate the extension's *.bundle.js and *.css files, and keep them up-to-date whenever the files they depend on change.

```
npm run watch
```

And finally, to load the extension in your browser:

* Firefox: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox
* Chrome: https://developer.chrome.com/extensions/getstarted#unpacked
* Edge: https://docs.microsoft.com/en-us/microsoft-edge/extensions/guides/adding-and-removing-extensions

If you'd like to do a one-off build without watching for file changes:

```
npm run build
```

And if you'd like to modify the build process, check with [Webpack](https://webpack.js.org/) and [Gulp](https://github.com/gulpjs/gulp/tree/master/docs) for the docs on webpack.config.js and gulpfile.js.
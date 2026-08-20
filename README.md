# Random Bookmark From Folder

This [WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions), made for Firefox, Chrome, & Edge, lets you select a bookmark folder and open a bookmark at random from it. It's made with an eye for customizability and good UX.

Get the stable version for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/random-bookmark-from-folder/) or [Chrome](https://chrome.google.com/webstore/detail/random-bookmark-from-fold/dcijbgljdombbkbmmkabanaopnnapcfd).

This project has a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to be as courteous, welcoming, and generally a lovely person as its terms require. ♡

No genAI is used or allowed in code or assets original to this project.

# First-time / Post-package.json-update setup

You will need [Node.js](https://nodejs.org/).

After you first obtain this repo's files, or whenever package.json is updated, run the command `npm install` to download all of the project's current dependencies.

# Building and working on Random Bookmark From Folder

For a one-time build, run `npm run build` to get build-firefox and build-chrome folders that each contain a ready-to-run extension.

If you'd like to make changes to Random Bookmark From Folder, do them on the source files in the WebExtension folder, and use the `npm run watch` command, which will both create the build-* folders and start a watcher process to keep it updated as you work. The .svelte files are [Svelte](https://svelte.technology/), and the .scss files are [Sass](http://sass-lang.com/).

The build process is handled by [Rollup](https://rollupjs.org/), configured with the rollup.config.mjs file.

# Testing the built extension

Which folder to load and how to load it depends on the browser you're testing with:

* **Firefox**: Load build-firefox as a [temporary extension](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/), or use [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/).
* **Waterfox**: Load build-firefox as a [temporary extension](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/). If you'd like to use [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) instead, you'll need to add the [--firefox option](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#:~:text=%2D%2Dfirefox,-%2C%20%2Df).
* **Vivaldi** and **Chrome**: Load build-chrome as an [unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).
* **Edge**: [Sideload](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading) the build-chrome folder.
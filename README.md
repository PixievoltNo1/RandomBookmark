# Random Bookmark From Folder

This [WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions), made for Firefox, Chrome, & Edge, lets you select a bookmark folder and open a bookmark at random from it. It's made with an eye for customizability and good UX.

Get the stable version for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/random-bookmark-from-folder/) or [Chrome](https://chrome.google.com/webstore/detail/random-bookmark-from-fold/dcijbgljdombbkbmmkabanaopnnapcfd).

This project has a Code of Conduct. By participating in this project, you agree to be as courteous, welcoming, and generally a lovely person as its terms require. ♡

# Writing & testing Random Bookmark From Folder

This project has a build process that converts [Svelte](https://svelte.technology/) templates (\*.svelte) and [Sass](http://sass-lang.com/) files (\*.scss) to JavaScript and CSS, and optimizes the whole project. With [Node](https://nodejs.org/) installed, run this command the first time you obtain this repo's files to fetch everything you need:

```
npm install
```

With that done, keep the following command running as you work. It'll generate a WebExtension-runnable folder.

```
npm run watch
```

And finally, to load the WebExtension-runnable folder in your browser:

* Firefox: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox
* Chrome: https://developer.chrome.com/extensions/getstarted#unpacked
* Edge: https://docs.microsoft.com/en-us/microsoft-edge/extensions/guides/adding-and-removing-extensions

If you'd like to do a one-off build without watching for file changes:

```
npm run build
```

And if you'd like to modify the build process, see [Parcel's documentation](https://parceljs.org/docs/).
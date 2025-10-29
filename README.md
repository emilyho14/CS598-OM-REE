# CS598-OM-REE

# RP Prototype instructions - taken from CS598 MP2

## Files
To help you get started, we've provided you with a few starter files. Here is a summary of each one and why you would need to change it:

| File name            | Short description                                 |
|----------------------|---------------------------------------------------|
| [`webpack.config.js`](./webpack.config.js) | file to define how your files are bundled when built. Only edit this if you add new javascript files or css files. |
| [`public/manifest.json`](public/manifest.json) | file defining structure and permissions for your extension. See more information in the [documentation](https://developer.chrome.com/docs/extensions/reference/manifest).  |
| [`public/data/mp-logo.png`](public/data/mp-logo.png)| default logo to appear in the Chrome extension page.  |
| [`src/script.js`](src/script.js) | content script containing tool's actual behavior. Use this file to interact with webpage HTML. |
| [`src/script.css`](src/script.css) | here's where you should define the CSS for any custom elements you create and use in [`src/script.js`](src/script.js). |
---


## Setup

### Initializing and Installing
Once you've cloned the repo, open up a terminal. I recommend opening up a terminal within your IDE (e.g., I use VS code's terminal). In the terminal, `cd` into the cloned directory and run the following commands to initialize `npm`, a package manager which will help you manage the packages needed for your tool.

```bash
npm init -y
npm install --package-lock-only
npm audit fix --force
npm install --save-dev webpack webpack-cli
npm install --save copy-webpack-plugin querystring-es3 babel-loader
```
Once these run successfully, open up `package.json` and add make sure the following lines are in the `script` field.

```json
"scripts": {
  "watch": "webpack --watch",
  "build": "webpack",
  ...
}
```

Back in the terminal, run this command:
```bash
npm run watch
```
This helps rebuild your project automatically every time you save a new change to any of your files! The only exception is the `webpack.config.js` file. If you change that, you'll have to restart `npm run watch` manually to reflect the changes.

If you hit an error at this point that says something like `Field 'browser' doesn't contain a valid alias configuration`, double check that you're in the root directory of the repository and that the `package.json` file you edited is also in the root directory. If you're not, `cd` into the repository and rerun the setup process.

### Adding the extension to your browser

This extension will work on Google Chrome (and probably any browser built on Chromium like Brave, Vivaldi, Opera, etc.). 
1. Open up your browser and navigate to the extension page, [chrome://extensions/](chrome://extensions/) on Google Chrome.
2. In the upper right of the page, there should be a "Developer mode" switch. Turn it on!
3. To add the extension to your browser, click "Load unpacked" in the upper left and navigate to the `build` folder in your repository. It's important that you use the `build` folder and not the parent `mp-2-tool-building` directory.

This should add your extension to the browser! When you navigate to a webpage matching the pattern matching the `"matches"` field in [`public/manifest.json`](`public/manifest.json`) (default is any reddit.com webpage), the extension code in your content script (i.e., [`src/script.js`](`src/script.js`)) will run automatically!

### Workflow

Here is a sample workflow when you're developing:
1. Make a change to one of the files.
2. `npm` automatically rebuilds your project and updates the contents of `build`.
3. Navigate to the extension page in your browser, [chrome://extensions/](chrome://extensions/).
4. Click the reload button on your extension to grab the updated `build` files.
5. Refresh the webpage where your extension works and the changes should apply!
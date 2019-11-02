'use strict';

const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  let dist = app.toTree();


  function getFastBootManifest() {
    let appFilePath = app.options.outputPaths.app.js.slice(1);
    let vendorFilePath = app.options.outputPaths.vendor.js.slice(1);
    let appFastbootFilePath = appFilePath.replace(/\.js$/, '') + '-fastboot.js';

    let manifest = {
      appFiles: [appFilePath, appFastbootFilePath],
      vendorFiles: [vendorFilePath],
      htmlFile: 'index.html',
    };

    defaults.project.addons.forEach(addon =>{
      if (addon.updateFastBootManifest) {
        manifest = addon.updateFastBootManifest(manifest);
      }
    });

    return manifest;
  }

  // create a single bundle to require from node, this is something that
  // `FastBoot` does for us when it is used, but since we are trying to demo
  // _generally_ what FastBoot does without actually using FastBoot at runtime
  // (e.g. to avoid sandboxing) it is much easier to concat the files we need
  // into a single dist file
  //
  let fastbootManifest = getFastBootManifest();
  let nodeBundle = concat(dist, {
    outputFile: 'assets/node-bundle.js',
    header: `
      module.exports = (() => {
    `,
    headerFiles: [].concat(
      fastbootManifest.vendorFiles,
      fastbootManifest.appFiles,
    ),
    footer: `
        return {
          Application: require('${defaults.project.name()}/app'),
          FastBootApplication: require('~fastboot/app-factory'),
          require,
          registry: requirejs.entries,
        };
      })();
    `,
  });

  return mergeTrees([dist, nodeBundle]);
};

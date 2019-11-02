'use strict';

const SimpleDOM = require('simple-dom');
const HTMLSerializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

Error.stackTraceLimit = Infinity;

function setupGlobals() {
  global.window = {};
  global.self = global.window;

  global.FastBoot = {
    config(name) {
      return require('./dist/package.json').fastboot.config[name];
    },

    // Normal FastBoot does a bunch of validation here, to make sure
    // that things aren't allowed to "require" when they shouldn't
    require(name) {
      return require(name);
    }
  };
}

function setupFastbootInfo(instance) {
  let fastbootInfo = {
    request: {

      // force `host()` to be some value, normally this comes from the
      // configured host whitelist
      host() {
        return 'localhost:4200'
      }
    },
  };

  instance.register('info:-fastboot', fastbootInfo, { instantiate: false });
  instance.inject('service:fastboot', '_fastbootInfo', 'info:-fastboot');
}

function buildBootOptions() {
  let doc = new SimpleDOM.Document();

  let rootElement = doc.body;
  let _renderMode = process.env.EXPERIMENTAL_RENDER_MODE_SERIALIZE ? 'serialize' : undefined;

  return {
    isBrowser: false,
    document: doc,
    rootElement,
    shouldRender: true,
    _renderMode,

    // fake request object here, because of an issue in ember-fetch
    request: { headers: {}, url: '/' },
  };
}

function generateHTML(doc) {
  let head = doc.head;
  let body = doc.body;

  return `
<html>
  <head>
    ${HTMLSerializer.serializeChildren(head)};
  </head>
  <body>
    <script type="x/boundary" id="fastboot-body-start"></script>${HTMLSerializer.serializeChildren(body)}<script type="x/boundary" id="fastboot-body-end"></script>
  </body>
</html>
  `;
}

async function main() {
  setupGlobals();

  let { FastBootApplication } = require('./dist/assets/node-bundle');

  let app = FastBootApplication.default();
  await app.boot();

  let instance = await app.buildInstance();

  let bootOptions = buildBootOptions();
  setupFastbootInfo(instance);

  await instance.boot(bootOptions);

  await instance.visit('/', bootOptions);

  let result = generateHTML(bootOptions.document);

  console.log(result);
}

main();

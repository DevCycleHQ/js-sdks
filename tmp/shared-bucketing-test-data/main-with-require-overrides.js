
/**
 * IMPORTANT: Do not modify this file.
 * This file allows the app to run without bundling in workspace libraries.
 * Must be contained in the ".nx" folder inside the output path.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');
const originalResolveFilename = Module._resolveFilename;
const distPath = __dirname;
const manifest = [{"module":"@devcycle/bucketing","exactMatch":"lib/shared/bucketing/src/index.js","pattern":"lib/shared/bucketing/src/index.ts"},{"module":"@devcycle/bucketing-test-data","exactMatch":"lib/shared/bucketing-test-data/src/index.js","pattern":"lib/shared/bucketing-test-data/src/index.ts"},{"module":"@devcycle/devcycle-js-sdk","exactMatch":"sdk/js/src/index.js","pattern":"sdk/js/src/index.ts"},{"module":"@devcycle/devcycle-react-native-sdk","exactMatch":"sdk/react-native/src/index.js","pattern":"sdk/react-native/src/index.ts"},{"module":"@devcycle/devcycle-react-sdk","exactMatch":"sdk/react/src/index.js","pattern":"sdk/react/src/index.ts"},{"module":"@devcycle/nodejs-server-sdk","exactMatch":"sdk/nodejs/src/index.js","pattern":"sdk/nodejs/src/index.ts"},{"module":"@devcycle/openfeature-nodejs-provider","exactMatch":"sdk/openfeature-nodejs-provider/src/index.js","pattern":"sdk/openfeature-nodejs-provider/src/index.ts"},{"module":"@devcycle/types","exactMatch":"lib/shared/types/src/index.js","pattern":"lib/shared/types/src/index.ts"}];

Module._resolveFilename = function(request, parent) {
  let found;
  for (const entry of manifest) {
    if (request === entry.module && entry.exactMatch) {
      const entry = manifest.find((x) => request === x.module || request.startsWith(x.module + "/"));
      const candidate = path.join(distPath, entry.exactMatch);
      if (isFile(candidate)) {
        found = candidate;
        break;
      }
    } else {
      const re = new RegExp(entry.module.replace(/\*$/, "(?<rest>.*)"));
      const match = request.match(re);

      if (match?.groups) {
        const candidate = path.join(distPath, entry.pattern.replace("*", ""), match.groups.rest + ".js");
        if (isFile(candidate)) {
          found = candidate;
        }
      }

    }
  }
  if (found) {
    const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
    return originalResolveFilename.apply(this, modifiedArguments);
  } else {
    return originalResolveFilename.apply(this, arguments);
  }
};

function isFile(s) {
  try {
    return fs.statSync(s).isFile();
  } catch (_e) {
    return false;
  }
}

// Call the user-defined main.
require('./lib/shared/bucketing-test-data/src/main.js');

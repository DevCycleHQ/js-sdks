const nxPreset = require('@nrwl/jest/preset');
const {resolve} = require('path');

module.exports = {
    ...nxPreset,
    testEnvironment: resolve(__dirname, './tools/jest/presets/base/environment')
}

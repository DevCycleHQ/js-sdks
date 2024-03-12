const { composePlugins, withNx } = require('@nx/webpack')
const path = require('path')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    // const workspaceRoot = path.resolve(__dirname, '../../..')
    // config.resolve = {
    //     ...config.resolve,
    //     alias: {
    //         ...config.resolve.alias,
    //         '@devcycle-client-sdk': `${workspaceRoot}/dist/sdk/`
    //     },
    //     modules: [`${workspaceRoot}/dist/sdk/`, 'node_modules'],
    // }
    return config
})

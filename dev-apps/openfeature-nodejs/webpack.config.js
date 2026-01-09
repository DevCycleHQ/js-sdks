const { composePlugins, withNx } = require('@nx/webpack')
const path = require('path')
const webpack = require('webpack')
const {
    configureExternals,
    configureNodeResolve,
} = require('../../webpack-utils')

module.exports = composePlugins(withNx(), (config, { options }) => {
    // turn on __dirname replacement so that the WASM file can be referenced by the assemblyscript lib
    config.node = {
        __dirname: true,
    }

    // Fix __dirname replacement for bucketing-assembly-script to use absolute path
    // This ensures path.resolve(__dirname) works correctly
    if (!config.plugins) {
        config.plugins = []
    }
    config.plugins.push(
        new webpack.DefinePlugin({
            __dirname: JSON.stringify(
                path.resolve(
                    __dirname,
                    '../../lib/shared/bucketing-assembly-script',
                ),
            ),
        }),
    )

    configureNodeResolve(config)
    // Don't use browser field for resolution
    if (!config.resolve.aliasFields) {
        config.resolve.aliasFields = []
    }
    // Ensure modules resolve from node_modules, not root
    if (!config.resolve.modules) {
        config.resolve.modules = ['node_modules']
    }

    configureExternals(config, options)
    return config
})

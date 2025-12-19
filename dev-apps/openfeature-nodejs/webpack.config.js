const { composePlugins, withNx } = require('@nx/webpack')
const path = require('path')
const webpack = require('webpack')

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
            '__dirname': JSON.stringify(path.resolve(__dirname, '../../lib/shared/bucketing-assembly-script'))
        })
    )
    
    if (!config.resolve) {
        config.resolve = {}
    }
    config.resolve.extensionAlias = {
        '.js': ['.ts', '.js'],
    }
    // Disable browser field resolution for node targets
    config.resolve.mainFields = ['main', 'module']
    config.resolve.conditionNames = ['node', 'require', 'import']
    // Don't use browser field for resolution
    if (!config.resolve.aliasFields) {
        config.resolve.aliasFields = []
    }
    // Ensure modules resolve from node_modules, not root
    if (!config.resolve.modules) {
        config.resolve.modules = ['node_modules']
    }
    // Configure externals - webpack externals function
    if (options.external && Array.isArray(options.external)) {
        config.externals = config.externals || []
        const externalArray = Array.isArray(config.externals)
            ? config.externals
            : [config.externals]
        config.externals = [
            ...externalArray,
            ...options.external.map((pkg) => ({
                [pkg]: `commonjs ${pkg}`,
            })),
        ]
    }
    return config
})

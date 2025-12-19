const { composePlugins, withNx } = require('@nx/webpack')
const path = require('path')

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
    const webpack = require('webpack')
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
    // Configure externals - use array format which is simpler and more reliable
    if (options.external && Array.isArray(options.external)) {
        // Convert to object format for webpack externals
        const externalsObj = {}
        options.external.forEach((pkg) => {
            externalsObj[pkg] = `commonjs ${pkg}`
        })
        const originalExternals = config.externals
        if (originalExternals) {
            if (Array.isArray(originalExternals)) {
                config.externals = [...originalExternals, externalsObj]
            } else if (typeof originalExternals === 'object') {
                config.externals = { ...originalExternals, ...externalsObj }
            } else {
                config.externals = [originalExternals, externalsObj]
            }
        } else {
            config.externals = externalsObj
        }
    }
    return config
})

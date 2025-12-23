const { composePlugins, withNx } = require('@nx/webpack')

module.exports = composePlugins(withNx(), (config, { options }) => {
    if (!config.resolve) {
        config.resolve = {}
    }
    config.resolve.extensionAlias = {
        '.js': ['.ts', '.js'],
    }
    // Disable browser field resolution for node targets
    config.resolve.mainFields = ['main', 'module']
    config.resolve.conditionNames = ['node', 'require', 'import']
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

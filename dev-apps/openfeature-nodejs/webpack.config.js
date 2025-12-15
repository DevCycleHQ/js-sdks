module.exports = (config, { options }) => {
    // turn on __dirname replacement so that the WASM file can be referenced by the assemblyscript lib
    config.node = {
        __dirname: true,
    }
    if (!config.resolve) {
        config.resolve = {}
    }
    // Disable browser field resolution for node targets
    config.resolve.mainFields = ['main', 'module']
    config.resolve.conditionNames = ['node', 'require', 'import']
    // Don't use browser field for resolution
    if (!config.resolve.aliasFields) {
        config.resolve.aliasFields = []
    }
    // Configure externals - webpack externals function
    if (options.external && Array.isArray(options.external)) {
        config.externals = config.externals || []
        const externalArray = Array.isArray(config.externals) ? config.externals : [config.externals]
        config.externals = [
            ...externalArray,
            ...options.external.map((pkg) => ({
                [pkg]: `commonjs ${pkg}`,
            })),
        ]
    }
    return config
}

module.exports = (config) => {
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
    return config
}

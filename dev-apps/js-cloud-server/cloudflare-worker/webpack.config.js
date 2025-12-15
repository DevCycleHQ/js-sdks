module.exports = (config) => {
    config.node = {
        __dirname: true,
    }
    if (!config.resolve) {
        config.resolve = {}
    }
    // Disable browser field resolution for node targets
    config.resolve.mainFields = ['main', 'module']
    config.resolve.conditionNames = ['node', 'require', 'import']
    return config
}


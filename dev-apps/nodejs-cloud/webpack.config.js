module.exports = (config) => {
    if (!config.resolve) {
        config.resolve = {}
    }
    config.resolve.extensionAlias = {
        '.js': ['.ts', '.js'],
    }
    // Disable browser field resolution for node targets
    config.resolve.mainFields = ['main', 'module']
    config.resolve.conditionNames = ['node', 'require', 'import']
    return config
}

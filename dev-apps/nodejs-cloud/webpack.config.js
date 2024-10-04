module.exports = (config) => {
    config.resolve.extensionAlias = {
        '.js': ['.ts', '.js'],
    }
    return config
}

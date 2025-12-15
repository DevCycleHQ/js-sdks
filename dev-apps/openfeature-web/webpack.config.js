const { composePlugins, withNx, withWeb } = require('@nx/webpack')

module.exports = composePlugins(withNx(), withWeb(), (config) => {
    config.resolve.extensionAlias = {
        '.js': ['.ts', '.js'],
        '.mjs': ['.mts', '.mjs'],
        '.cjs': ['.cts', '.cjs'],
    }
    return config
})


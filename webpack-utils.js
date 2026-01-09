/**
 * Shared webpack configuration utilities
 */

/**
 * Merges external packages from Nx options into webpack config.externals.
 * Handles array, object, and function formats for existing externals.
 *
 * @param {Object} config - Webpack configuration object
 * @param {Object} options - Nx build options
 */
function configureExternals(config, options) {
    if (!options.external || !Array.isArray(options.external)) {
        return
    }

    const externalPackages = options.external.map((pkg) => ({
        [pkg]: `commonjs ${pkg}`,
    }))

    const originalExternals = config.externals
    if (!originalExternals) {
        config.externals = externalPackages
    } else if (Array.isArray(originalExternals)) {
        config.externals = [...originalExternals, ...externalPackages]
    } else {
        config.externals = [originalExternals, ...externalPackages]
    }
}

/**
 * Configures resolve settings for Node.js targets.
 * Sets up extension aliases, main fields, and condition names.
 *
 * @param {Object} config - Webpack configuration object
 */
function configureNodeResolve(config) {
    if (!config.resolve) {
        config.resolve = {}
    }
    config.resolve.extensionAlias = {
        '.js': ['.ts', '.js'],
    }
    config.resolve.mainFields = ['main', 'module']
    config.resolve.conditionNames = ['node', 'require', 'import']
}

module.exports = {
    configureExternals,
    configureNodeResolve,
}

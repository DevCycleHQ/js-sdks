const { composePlugins, withNx, withWeb } = require('@nx/webpack')
const path = require('path')

module.exports = composePlugins(withNx(), withWeb(), (config, { options }) => {
    const libraryTarget = options.libraryTarget
    const libraryName = options.libraryName

    config.optimization = config.optimization || {}
    config.optimization.runtimeChunk = false

    config.entry = config.entry || {}
    if (config.entry.main) {
        delete config.entry.main
    }

    const entryPath = path.resolve(__dirname, '../../', options.main)
    config.entry[libraryName] = {
        import: entryPath,
        library: {
            name: libraryName,
            type: libraryTarget,
            umdNamedDefine: true,
        },
    }

    config.output = {
        ...config.output,
        filename: `${libraryName.toLowerCase()}.min.js`,
    }

    return config
})

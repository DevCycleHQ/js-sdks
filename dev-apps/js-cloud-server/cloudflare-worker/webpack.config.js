const { composePlugins, withNx } = require('@nx/webpack')
const {
    configureExternals,
    configureNodeResolve,
} = require('../../../webpack-utils')

module.exports = composePlugins(withNx(), (config, { options }) => {
    config.node = {
        __dirname: true,
    }
    configureNodeResolve(config)
    configureExternals(config, options)
    return config
})

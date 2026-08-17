const { composePlugins, withNx, withWeb } = require('@nx/webpack')

module.exports = composePlugins(withNx(), withWeb(), (config) => config)

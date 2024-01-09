const { getWebpackConfig } = require('@nx/react/plugins/webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = (env, argv) => {
    const config = getWebpackConfig(env, argv)

    if (process.env.ANALYZE === 'true') {
        // Modify the config or add additional plugins
        config.plugins.push(new BundleAnalyzerPlugin())
    }

    return config
}

const { composePlugins, withNx } = require('@nx/webpack')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
    // Note: This was added by an Nx migration. Webpack builds are required to have a corresponding Webpack config file.
    // See: https://nx.dev/recipes/webpack/webpack-config-setup

    // Add CSS loader configuration
    config.module = config.module || {}
    config.module.rules = config.module.rules || []

    // Add rule for CSS files
    config.module.rules.push({
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
    })

    return config
})

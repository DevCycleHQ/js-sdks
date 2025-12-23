const { composePlugins, withNx, withWeb } = require('@nx/webpack')
const webpack = require('webpack') // Ensure webpack is installed and required

module.exports = composePlugins(withNx(), withWeb(), (config) => {
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY': JSON.stringify(
                process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY,
            ),
        }),
    )
    return config
})

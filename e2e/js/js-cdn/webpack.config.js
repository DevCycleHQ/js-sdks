const { composePlugins, withNx } = require('@nx/webpack')
const webpack = require('webpack') // Ensure webpack is installed and required

module.exports = composePlugins(withNx(), (config) => {
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY': JSON.stringify(
                process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY,
            ),
        }),
    )
    return config
})

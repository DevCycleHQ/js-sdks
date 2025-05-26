const { composePlugins, withNx } = require('@nx/webpack')
const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Load .env file for DefinePlugin
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

module.exports = composePlugins(withNx(), (config, passedArgs) => {
    const options = passedArgs.options
    const context = passedArgs.context

    config.plugins = config.plugins || []

    config.plugins.push(
        new Dotenv({
            path: path.resolve(__dirname, '.env'),
            safe: false,
            systemvars: true,
            silent: false,
        }),
    )

    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY': JSON.stringify(
                process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY,
            ),
        }),
    )

    const workspaceRoot = context?.workspaceRoot || context?.root

    if (options?.index && workspaceRoot) {
        const templatePath = path.resolve(workspaceRoot, options.index)
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: templatePath,
                filename: 'index.html',
            }),
        )
    }

    return config
})

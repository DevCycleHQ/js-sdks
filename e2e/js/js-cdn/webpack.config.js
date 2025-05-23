const { composePlugins, withNx } = require('@nx/webpack')
const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Load .env file for DefinePlugin
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

module.exports = composePlugins(withNx(), (config, passedArgs) => {
    // console.log(
    //    '[DEBUG] Webpack config args (passedArgs):',
    //    JSON.stringify(passedArgs, null, 2)
    // );

    const options = passedArgs.options
    const context = passedArgs.context

    // console.log('[DEBUG] passedArgs.context:', JSON.stringify(context, null, 2));
    // console.log('[DEBUG] config.context (from webpack):', config.context);

    config.plugins = config.plugins || [] // Ensure plugins array exists

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

    const workspaceRoot = context
        ? context.workspaceRoot || context.root
        : undefined
    // console.log(`[DEBUG] Determined workspaceRoot: ${workspaceRoot}`);

    // Add HtmlWebpackPlugin if options and context are available
    if (options && options.index && workspaceRoot) {
        const templatePath = path.resolve(workspaceRoot, options.index)
        console.log(
            `[DEBUG] HtmlWebpackPlugin: Using template path: ${templatePath}`,
        )
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: templatePath,
                filename: 'index.html', // Ensure output is index.html
            }),
        )
    } else {
        console.error(
            '[Error] HtmlWebpackPlugin not configured due to missing properties.',
        )
        if (!options) {
            console.error('[Error] passedArgs.options is undefined.')
        } else {
            if (!options.index)
                console.error(
                    '[Error] passedArgs.options.index is undefined. Value:',
                    options.index,
                )
        }
        if (!workspaceRoot) {
            console.error(
                '[Error] workspaceRoot could not be determined from context.',
            )
            if (context) {
                console.error(
                    `[DEBUG] context.workspaceRoot: ${context.workspaceRoot}, context.root: ${context.root}`,
                )
            } else {
                console.error('[Error] passedArgs.context is undefined.')
            }
        }
    }

    // Removed: config.devServer = config.devServer || {};
    // Removed commented out devServer modifications as Nx defaults are sufficient.

    // Removed verbose final config log

    return config
})

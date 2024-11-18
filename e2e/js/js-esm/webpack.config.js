const HtmlWebpackPlugin = require('html-webpack-plugin')
const DefinePlugin = require('webpack').DefinePlugin
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const path = require('path')

module.exports = () => ({
    entry: './src/index.ts',
    mode: 'production',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new DefinePlugin({
            'process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY': JSON.stringify(
                process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY,
            ),
        }),
        new ForkTsCheckerWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/i,
                use: ['sass-to-string', 'sass-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        port: 3000,
        historyApiFallback: {
            index: 'index.html',
        },
        client: {
            overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: true,
            },
        },
    },
    stats: {
        warnings: false,
    },
})

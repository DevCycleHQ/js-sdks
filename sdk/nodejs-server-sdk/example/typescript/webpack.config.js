/* eslint no-process-env: off */
const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = (env = {}) => ({
    mode: env.dev ? 'development' : 'production',
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.min.js'
    },
    target: 'node',
    devtool: 'source-map',
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.ts']
    },
    externals: [
        nodeExternals({
            modulesDir: 'node_modules'
        })
    ],
    plugins: [],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                noEmit: false
                            }
                        }
                    }
                ]
            }
        ]
    }
})

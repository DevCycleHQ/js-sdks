const { composePlugins, withNx } = require('@nx/webpack')
const { withReact } = require('@nx/react')

// Nx plugins for webpack.
module.exports = composePlugins(
    withNx(),
    withReact({
        // Uncomment this line if you don't want to use SVGR
        // See: https://react-svgr.com/
        // svgr: false
    }),
    (config) => {
        // Update the webpack config as needed here.
        // e.g. `config.plugins.push(new MyPlugin())`

        config.resolve.alias = {
            ...(config.resolve.alias ?? {}),
            'react-native$': 'react-native-web',
        }
        config.resolve.extensions = [
            '.web.tsx',
            '.web.ts',
            '.web.jsx',
            '.web.js',
            ...config.resolve.extensions,
        ]
        config.module.rules.push({
            test: /\.(js|jsx)$/,
            include: /react-native-vector-icons/,
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env',
                    ['@babel/preset-react', { runtime: 'automatic' }],
                ],
            },
        })

        return config
    },
)

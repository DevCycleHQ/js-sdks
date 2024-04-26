const { composePlugins, withNx } = require('@nx/webpack')
const { withReact } = require('@nx/react')

// Nx composable plugins for webpack.
module.exports = composePlugins(
    withNx(),
    withReact(),
    (config, { options, context }) => {
        config.resolve.extensionAlias = {
            '.js': ['.ts', '.js'],
            '.mjs': ['.mts', '.mjs'],
            '.cjs': ['.cts', '.cjs'],
        }
        return config
    },
)

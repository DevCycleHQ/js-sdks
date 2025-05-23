const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = (config, { options }) => {
    const libraryTarget = options.libraryTarget
    const libraryName = options.libraryName
    // Try options.root, then config.context, then process.cwd() as fallback for workspaceRoot
    const workspaceRoot = options.root || config.context || process.cwd();

    config.mode = 'production';

    config.optimization = config.optimization || {}
    config.optimization.runtimeChunk = false

    config.entry = config.entry || {}
    try {
        delete config.entry.main
    } catch (error) {
        console.warn(`Could not delete entry.main: ${error}`)
    }

    config.entry[libraryName] = {
        import: options.main,
        library: {
            name: libraryName,
            type: libraryTarget,
            umdNamedDefine: true,
        },
    }

    config.output = {
        ...config.output,
        path: path.resolve(workspaceRoot, options.outputPath),
        filename: `${libraryName.toLowerCase()}.min.js`,
    }

    config.resolve = config.resolve || {};
    config.resolve.extensions = config.resolve.extensions || [];
    if (!config.resolve.extensions.includes('.ts')) {
        config.resolve.extensions.push('.ts');
    }
    if (!config.resolve.extensions.includes('.js')) {
        config.resolve.extensions.push('.js');
    }

    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(new TsconfigPathsPlugin({
        configFile: options.tsConfig,
    }));

    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    const tsLoaderRule = {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
            configFile: options.tsConfig,
        },
    };

    const hasExistingTsRule = config.module.rules.some(
        (rule) => rule.test && rule.test.toString().includes('\\.ts')
    );

    if (!hasExistingTsRule) {
        config.module.rules.push(tsLoaderRule);
    }

    return config
}

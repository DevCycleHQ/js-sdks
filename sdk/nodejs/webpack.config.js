const path = require('path')

module.exports = (config) => {
    // Modify the existing configuration
    config.mode = 'development'
    config.entry = {
        main: path.join(__dirname, './src/index.ts'),
    }
    config.output = {
        ...config.output,
        libraryTarget: 'umd',
    }
    config.resolve.extensions.push('.ts', '.js')

    // Add a new rule for TypeScript files
    config.module.rules.push({
        test: /\.(js|ts)$/,
        include: path.resolve(__dirname, 'src'),
        use: {
            loader: 'babel-loader',
            options: {
                configFile: path.resolve(__dirname, 'babel.config.js'),
            },
        },
    })

    return config
}

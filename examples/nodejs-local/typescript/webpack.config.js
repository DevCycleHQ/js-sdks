module.exports = (config) => {
    // config.experiments ??= {}
    // config.experiments.asyncWebAssembly = true
    config.node = {
        __dirname: true,
    }
    config.context = config.context + '/../../..'
    console.log(config)

    return config
}

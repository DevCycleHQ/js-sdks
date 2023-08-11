module.exports = (config) => {
    // turn on __dirname replacement so that the WASM file can be referenced by the assemblyscript lib
    config.node = {
        __dirname: true,
    }
    // set the "context" for where __dirname should be relative to, to the root of the repo.
    config.context = config.context + '/../../..'
    return config
}

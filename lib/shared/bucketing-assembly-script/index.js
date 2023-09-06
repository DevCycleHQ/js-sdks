const ProtobufTypes = require('./protobuf/compiled')
const path = require('path')

const instantiate = async (debug = false, imports = {}) => {
    const releaseStr = debug ? 'debug' : 'release'
    const { instantiate } = require(`./build/bucketing-lib.${releaseStr}.js`)
    // using path.resolve here to fix an issue caused by webpack in the example apps
    // In normal operation __dirname is an absolute path, so path.resolve does nothing to it
    // When running from the example app webpack bundle, __dirname becomes a relative path (relative to the repo root)
    // We therefore need to 'path.resolve' it relative to the current working directory (which must be the repo root
    // when running any Nx commands like serving the example app)
    const url = new URL(
        `file://${path.resolve(
            __dirname,
        )}/build/bucketing-lib.${releaseStr}.wasm`,
    )

    // asynchronously compile the webassembly source
    const compiled = await (async () => {
        try {
            const source = await globalThis.fetch(url)
            return await globalThis.WebAssembly.compileStreaming(source)
        } catch {
            let fs
            try {
                fs = require('node:fs/promises')
            } catch {
                fs = require('fs/promises')
            }
            return globalThis.WebAssembly.compile(await fs.readFile(url))
        }
    })()

    // call the instantiate function with the compiled source to execute the WASM and set up the bindings to native code
    return await instantiate(compiled, imports)
}

module.exports = {
    instantiate,
    ProtobufTypes,
}

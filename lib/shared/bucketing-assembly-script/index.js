const ProtobufTypes = require('./protobuf/compiled')

let wasmFileData

exports.getWASMFileData = () => {
    return wasmFileData
}

const instantiate = async (debug = false) => {
    const releaseStr = debug ? 'debug' : 'release'
    const { instantiate } = require(`./build/bucketing-lib.${releaseStr}`)
    const url = new URL(`file://${__dirname}/build/bucketing-lib.${releaseStr}.wasm`)

    // asynchronously compile the webassembly source
    const compiled = await (async () => {
        // try {
        //     const source = await globalThis.fetch(url)
        //
        //     return await globalThis.WebAssembly.compileStreaming(source)
        // } catch {
            const fs = require('node:fs/promises')
            wasmFileData = await fs.readFile(url)
            return globalThis.WebAssembly.compile(wasmFileData)
        // }
    })()

    // call the instantiate function with the compiled source to execute the WASM and set up the bindings to native code
    if (debug) {
        const { instantiate: instantiateDebug } = require('./build/bucketing-lib.debug')
        return await instantiateDebug(compiled, {})
    } else {
        return await instantiate(compiled, {})
    }
}

module.exports = {
    instantiate,
    ProtobufTypes
}

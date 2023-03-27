const ProtobufTypes = require('./protobuf/compiled')
const { Rtrace } = require('@assemblyscript/rtrace')

const rtrace = new Rtrace({
    onerror(err, info) {
        // handle error
    },
    oninfo(msg) {
        // print message, optional
        console.log('RTRACE: ' + msg)
    },
    getMemory() {
        // obtain the module's memory,
        // e.g. using --exportStart:
        // return instance.exports.memory
    }
})

const instantiate = async (debug = false, imports = {}) => {
    const releaseStr = debug ? 'debug' : 'release'
    const { instantiate } = require(`./build/bucketing-lib.${releaseStr}`)
    const url = new URL(`file://${__dirname}/build/bucketing-lib.${releaseStr}.wasm`)

    const updatedImports = rtrace.install(imports)

    // asynchronously compile the webassembly source
    const compiled = await (async () => {
        try {
            const source = await globalThis.fetch(url)
            return await globalThis.WebAssembly.compileStreaming(source)
        } catch {
            const fs = require('node:fs/promises')
            return globalThis.WebAssembly.compile(await fs.readFile(url))
        }
    })()

    // call the instantiate function with the compiled source to execute the WASM and set up the bindings to native code
    if (debug) {
        const { instantiate: instantiateDebug } = require('./build/bucketing-lib.debug')
        return await instantiateDebug(compiled, updatedImports)
    } else {
        return await instantiate(compiled, updatedImports)
    }
}

module.exports = {
    instantiate,
    ProtobufTypes
}

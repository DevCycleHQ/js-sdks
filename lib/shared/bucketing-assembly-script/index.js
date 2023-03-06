const { instantiate } = require('./build/bucketing-lib.release')

exports.instantiate = async (debug = false) => {
    const url = new URL(`file://${__dirname}/build/bucketing-lib.${debug ? 'debug' : 'release'}.wasm`)

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
        return await instantiateDebug(compiled, {})
    } else {
        return await instantiate(compiled, {})
    }
}

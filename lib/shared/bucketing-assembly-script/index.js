const { instantiate } = require('./build/bucketing-lib.release')

const url = new URL(`file://${__dirname}/build/bucketing-lib.release.wasm`)

exports.instantiate = async () => {
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
    return await instantiate(compiled, {})
}

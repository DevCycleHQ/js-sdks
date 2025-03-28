const ProtobufTypes = require('./protobuf/compiled')
const path = require('path')

const isEdgeRuntime = () => {
    return process.env.NEXT_RUNTIME === 'edge'
}

const base64ToUint8Array = (base64) => {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

// Import WASM modules at the top level for Edge Runtime
import releaseWasmModule from './build/bucketing-lib.release.wasm?module'
import debugWasmModule from './build/bucketing-lib.debug.wasm?module'

const instantiate = async (debug = false, imports = {}) => {
    const releaseStr = debug ? 'debug' : 'release'
    let compiled
    console.log(`isEdgeRuntime: ${isEdgeRuntime()}`)

    if (isEdgeRuntime()) {
        console.log('Using Edge Runtime WASM binary')
        try {
            // Use the appropriate WASM module based on debug flag
            const wasmModule = debug ? debugWasmModule : releaseWasmModule
            console.log('WASM module loaded:', {
                type: typeof wasmModule,
                isArray: Array.isArray(wasmModule),
                isBuffer: Buffer.isBuffer(wasmModule),
                length: wasmModule?.length,
                keys: Object.keys(wasmModule)
            })

            // If the module is a string with numeric keys, convert it to a Uint8Array
            let wasmBinary
            if (typeof wasmModule === 'string' && Object.keys(wasmModule).every(key => !isNaN(key))) {
                // Convert string to Uint8Array
                wasmBinary = new Uint8Array(wasmModule.length)
                for (let i = 0; i < wasmModule.length; i++) {
                    wasmBinary[i] = wasmModule.charCodeAt(i)
                }
            } else {
                // Try to use the default export if available
                wasmBinary = base64ToUint8Array(wasmModule.default)
            }

            console.log('Converted to Uint8Array:', {
                length: wasmBinary.length,
                byteLength: wasmBinary.byteLength,
                firstBytes: Array.from(wasmBinary.slice(0, 4))
            })

            // Instantiate with the buffer
            const { instance } = await WebAssembly.instantiate(wasmBinary, imports)
            return instance.exports
        } catch (e) {
            console.error('Failed to instantiate WASM in Edge Runtime:', e)
            throw e
        }
    } else {
        const { instantiate } = require(`./build/bucketing-lib.${releaseStr}.js`)
        /**
         * using path.resolve here to fix an issue caused by webpack in the example apps
         * In normal operation __dirname is an absolute path, so path.resolve does nothing to it
         * When running from the example app webpack bundle, __dirname becomes a relative path
         * (relative to the repo root)
         * We therefore need to 'path.resolve' it relative to the current working directory
         * (which must be the repo root when running any Nx commands like serving the example app)
         */
        const url = new URL(
            `file://${path.resolve(
                __dirname,
            )}/build/bucketing-lib.${releaseStr}.wasm`,
        )

        compiled = await (async () => {
            try {
                const source = await globalThis.fetch(url)
                return await globalThis.WebAssembly.compileStreaming(source)
            } catch {
                let fs
                try {
                    const prefix = 'node:'
                    const suffix = 'fs/promises'
                    fs = require(prefix + suffix)
                } catch {
                    fs = require('fs/promises')
                }
                return globalThis.WebAssembly.compile(await fs.readFile(url))
            }
        })()
    }

    return await instantiate(compiled, imports)
}

export {
    instantiate,
    ProtobufTypes,
}

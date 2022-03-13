/**
 * Load WebAssembly package and export as Module
 */

const fs = require("fs")
const loader = require("@assemblyscript/loader")

const wasmModule = loader.instantiateSync(fs.readFileSync("../../build/bucketing-lib-debug.wasm"))
module.exports = wasmModule.exports

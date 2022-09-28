const { instantiate } = require('./build/bucketing-lib.release')

// Instantiation method for CF Worker / Web Worker environments
exports.instantiate = async () => {
    // eslint-disable-next-line no-undef
    return await instantiate(BUCKETING_WASM, {})
}

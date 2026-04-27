// CJS shim for uuid v14+ (ESM-only) to maintain Jest CJS compatibility
const { randomUUID } = require('crypto')

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

module.exports = {
    v4: randomUUID,
    validate: (str) => typeof str === 'string' && UUID_REGEX.test(str),
    v1: () => {
        throw new Error('uuid v1 not implemented in shim')
    },
    v3: () => {
        throw new Error('uuid v3 not implemented in shim')
    },
    v5: () => {
        throw new Error('uuid v5 not implemented in shim')
    },
}

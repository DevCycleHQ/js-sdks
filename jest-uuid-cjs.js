// CJS shim for uuid v14+ (ESM-only) to maintain Jest CJS compatibility
const { randomUUID } = require('crypto')

module.exports = {
    v4: randomUUID,
    v1: () => { throw new Error('uuid v1 not implemented in shim') },
    v3: () => { throw new Error('uuid v3 not implemented in shim') },
    v5: () => { throw new Error('uuid v5 not implemented in shim') },
}

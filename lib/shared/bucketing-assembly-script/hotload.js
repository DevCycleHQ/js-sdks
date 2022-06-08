import * as debug from 'build/bucketing-lib.debug'
import * as release from 'build/bucketing-lib.release'

export const allExports = !!Number(process.env.DEVCYCLE_USE_DEBUG_WASM) ? debug : release

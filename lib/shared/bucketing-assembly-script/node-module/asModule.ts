/**
 * Load WebAssembly package and export as Module
 */

import fs from 'fs'
import path from 'path'
import type * as BucketingLib from '../build/bucketing-lib-debug'
import { instantiateSync } from '@assemblyscript/loader'

export const wasmModule = instantiateSync<typeof BucketingLib>(
    fs.readFileSync(path.resolve(__dirname, '../build/bucketing-lib-debug.wasm'))
)

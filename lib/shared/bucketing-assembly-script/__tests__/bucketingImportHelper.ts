import { instantiate, Exports } from '../index'

let bucketingWASM: Exports | null

async function initialize(debug = true) {
    bucketingWASM = await instantiate(debug)
    Object.assign(bucketingExports, bucketingWASM)
    setInterval(trackWASMMemory, 100)
}

function trackWASMMemory() {
    if (!bucketingWASM || !process.env.LOG_WASM_MEMORY) return
    const memoryUsageMB = bucketingWASM.memory.buffer.byteLength / 1e6
    console.log(`WASM memory usage: ${memoryUsageMB} MB`)
}

type BucketingExports = Exports & {
    initialize: (debug?: boolean) => Promise<void>
}

const bucketingExports: BucketingExports = {
    initialize
} as BucketingExports

export = bucketingExports

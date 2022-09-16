import { instantiate, Exports } from '../index.cjs'

async function initialize() {
    const methods = await instantiate()
    Object.assign(bucketingExports, methods)
}

type BucketingExports = Exports & {
    initialize: () => Promise<void>
}

const bucketingExports: BucketingExports = {
    initialize
} as BucketingExports

export = bucketingExports

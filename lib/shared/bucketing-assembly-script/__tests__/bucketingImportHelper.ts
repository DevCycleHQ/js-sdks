import { instantiate, Exports } from '../index'

async function initialize() {
    const methods = await instantiate(true)
    Object.assign(bucketingExports, methods)
}

type BucketingExports = Exports & {
    initialize: () => Promise<void>
}

const bucketingExports: BucketingExports = {
    initialize
} as BucketingExports

export = bucketingExports

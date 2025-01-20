import { instantiate, Exports } from '../index'

async function initialize(debug = true) {
    const methods = await instantiate(debug)
    Object.assign(bucketingExports, methods)
}

type BucketingExports = Exports & {
    initialize: (debug?: boolean) => Promise<void>
}

const bucketingExports: BucketingExports = {
    initialize,
} as BucketingExports

export = bucketingExports

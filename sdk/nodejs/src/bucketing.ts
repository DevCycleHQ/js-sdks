import { instantiate, Exports } from '@devcycle/bucketing-assembly-script'

let Bucketing: Exports
export const importBucketingLib = async (): Promise<void> => {
    Bucketing = await instantiate()
}

export const getBucketingLib = (): typeof Bucketing => {
    if (!Bucketing) {
        throw new Error('Bucketing library not loaded')
    }
    return Bucketing
}

import { instantiate, Exports } from '@devcycle/bucketing-assembly-script'

let Bucketing: Exports | null
export const importBucketingLib = async (): Promise<void> => {
    Bucketing = await instantiate()
}

export const getBucketingLib = (): Exports => {
    if (!Bucketing) {
        throw new Error('Bucketing library not loaded')
    }
    return Bucketing
}

export const cleanupBucketingLib = (): void => {
    Bucketing = null
}

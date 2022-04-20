let Bucketing: typeof import('@devcycle/bucketing-assembly-script')
export const importBucketingLib = async (): Promise<void> => {
    Bucketing = await (Function('return import("@devcycle/bucketing-assembly-script")')() as Promise<
        typeof import('@devcycle/bucketing-assembly-script')
        >)
}

export const getBucketingLib = (): typeof Bucketing => {
    if (!Bucketing) {
        throw new Error('Bucketing library not loaded')
    }
    return Bucketing
}

let Bucketing: unknown

const testVariable = {
    _id: 'test-id',
    value: true,
    type: 'Boolean',
    key: 'test-key',
    evalReason: null
}

export const importBucketingLib = async (): Promise<void> => {
    Bucketing = await new Promise((resolve) => resolve({
        setConfigData: jest.fn(),
        setPlatformData: jest.fn(),
        generateBucketedConfigForUser: jest.fn().mockReturnValue(JSON.stringify({
            variables: { 'test-key': testVariable }
        })),
        variableForUser: jest.fn().mockReturnValue(JSON.stringify(testVariable))
    }))
}

export const getBucketingLib = (): unknown => {
    if (!Bucketing) {
        throw new Error('Bucketing library not loaded')
    }
    return Bucketing
}

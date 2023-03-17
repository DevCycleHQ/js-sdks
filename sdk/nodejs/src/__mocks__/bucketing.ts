import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'

let Bucketing: unknown

const testVariable = {
    _id: 'test-id',
    value: true,
    type: 'Boolean',
    key: 'test-key',
    evalReason: null
}
const buffer = ProtobufTypes.SDKVariable_PB.encode({
    _id: testVariable._id,
    type: 0,
    key: testVariable.key,
    boolValue: testVariable.value,
    doubleValue: 0,
    stringValue: ''
}).finish()

enum VariableType {
    Boolean,
    Number,
    String,
    JSON,
}

export const importBucketingLib = async (): Promise<void> => {
    Bucketing = await new Promise((resolve) => resolve({
        setConfigData: jest.fn(),
        setPlatformData: jest.fn(),
        generateBucketedConfigForUser: jest.fn().mockReturnValue(JSON.stringify({
            variables: { 'test-key': testVariable }
        })),
        variableForUser: jest.fn().mockReturnValue(JSON.stringify(testVariable)),
        variableForUser_PB: jest.fn().mockReturnValue(buffer),
        VariableType
    }))
}

export const getBucketingLib = (): unknown => {
    if (!Bucketing) {
        throw new Error('Bucketing library not loaded')
    }
    return Bucketing
}

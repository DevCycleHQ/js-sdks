import { Exports, ProtobufTypes } from '@devcycle/bucketing-assembly-script'
import { EVAL_REASON_DETAILS, EVAL_REASONS } from '@devcycle/types'

const testVariable = {
    _id: 'test-id',
    value: true,
    type: 'Boolean',
    key: 'test-key',
    evalReason: null,
    eval: {
        reason: EVAL_REASONS.TARGETING_MATCH,
        details: EVAL_REASON_DETAILS.ALL_USERS,
        target_id: 'mockTargetId',
    },
}
const buffer = ProtobufTypes.SDKVariable_PB.encode({
    _id: testVariable._id,
    type: 0,
    key: testVariable.key,
    boolValue: testVariable.value,
    doubleValue: 0,
    stringValue: '',
    eval: testVariable.eval,
}).finish()

enum VariableType {
    Boolean,
    Number,
    String,
    JSON,
}

export const importBucketingLib = async (): Promise<[Exports, undefined]> => {
    const bucketing = await Promise.resolve({
        setConfigData: jest.fn(),
        setConfigDataUTF8: jest.fn(),
        setPlatformData: jest.fn(),
        generateBucketedConfigForUser: jest.fn().mockReturnValue(
            JSON.stringify({
                variables: { 'test-key': testVariable },
            }),
        ),
        variableForUser: jest
            .fn()
            .mockReturnValue(JSON.stringify(testVariable)),
        variableForUser_PB: jest.fn().mockReturnValue(buffer),
        setClientCustomData: jest.fn(),
        VariableType,
        initEventQueue: jest.fn(),
        flushEventQueue: jest.fn(),
    })
    return [bucketing as unknown as Exports, undefined]
}

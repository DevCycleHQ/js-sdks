import {
    variableForUser_PB,
    VariableType
} from '../bucketingImportHelper'
import protobuf, { Type } from 'protobufjs'
import path from 'path'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData
import { initSDK } from '../setPlatformData'

describe('protobuf variable tests', () => {
    const sdkKey = 'sdkKey'
    let VariableForUserParams_PB: Type
    let SDKVariable_PB: Type

    beforeAll(() => {
        const protoFile = '../../assembly/types/protobuf/variableForUserParams.proto'
        const filePath = path.resolve(__dirname, protoFile)
        const root = protobuf.loadSync(filePath)

        VariableForUserParams_PB = root.lookupType('VariableForUserParams_PB')
        if (!VariableForUserParams_PB) throw new Error('VariableForUserParams_PB not found')

        SDKVariable_PB = root.lookupType('SDKVariable_PB')
        if (!SDKVariable_PB) throw new Error('SDKVariable_PB not found')

        initSDK(sdkKey, config)
    })

    it('should write protobuf message', () => {
        const params = {
            sdkKey: sdkKey,
            variableKey: 'swagTest',
            variableType: 2,
            user: {
                userId: 'asuh',
                country: { value: 'canada', isNull: false },
                email: { value: 'test', isNull: false }
            }
        }
        const err = VariableForUserParams_PB.verify(params)
        if (err) throw new Error(err)

        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = VariableForUserParams_PB.encode(pbMsg).finish()
        const resultBuffer = variableForUser_PB(buffer)
        expect(resultBuffer).not.toBeNull()

        const sdkVariable = SDKVariable_PB.decode(resultBuffer!)
        expect(sdkVariable).toEqual({
            '_id': '615356f120ed334a6054564c',
            'boolValue': false,
            'doubleValue': 0,
            'evalReason': {
                'isNull': true,
                'value': '',
            },
            'key': 'swagTest',
            'stringValue': 'YEEEEOWZA',
            'type': VariableType.String,
        })
    })

})

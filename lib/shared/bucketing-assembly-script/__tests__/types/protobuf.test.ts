import {
    variableForUser_PB,
    VariableType,
    testVariableForUserParams_PB,
    testDVCUser_PB,
    testSDKVariable_PB
} from '../bucketingImportHelper'
import protobuf, { Type } from 'protobufjs'
import path from 'path'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData
import { initSDK } from '../setPlatformData'

describe('protobuf variable tests', () => {
    const sdkKey = 'sdkKey'
    let VariableForUserParams_PB: Type
    let DVCUser_PB: Type
    let SDKVariable_PB: Type

    const callVariableForUser_PB = (params: any): Uint8Array | null => {
        const err = VariableForUserParams_PB.verify(params)
        if (err) throw new Error(err)

        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = VariableForUserParams_PB.encode(pbMsg).finish()
        return variableForUser_PB(buffer)
    }

    const callTestVariableForUserParams_PB = (params: any): Uint8Array | null => {
        const err = VariableForUserParams_PB.verify(params)
        if (err) throw new Error(err)

        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = VariableForUserParams_PB.encode(pbMsg).finish()
        return testVariableForUserParams_PB(buffer)
    }

    const callTestDVCUser_PB = (user: any): Uint8Array | null => {
        const err = DVCUser_PB.verify(user)
        if (err) throw new Error(err)

        const pbMsg = DVCUser_PB.create(user)
        const buffer = DVCUser_PB.encode(pbMsg).finish()
        return testDVCUser_PB(buffer)
    }

    const callTestSDKVariable_PB = (variable: any): Uint8Array | null => {
        const err = SDKVariable_PB.verify(variable)
        if (err) throw new Error(err)

        const pbMsg = SDKVariable_PB.create(variable)
        const buffer = SDKVariable_PB.encode(pbMsg).finish()
        return testSDKVariable_PB(buffer)
    }

    beforeAll(() => {
        const protoFile = '../../assembly/types/protobuf/variableForUserParams.proto'
        const filePath = path.resolve(__dirname, protoFile)
        const root = protobuf.loadSync(filePath)

        VariableForUserParams_PB = root.lookupType('VariableForUserParams_PB')
        if (!VariableForUserParams_PB) throw new Error('VariableForUserParams_PB not found')

        DVCUser_PB = root.lookupType('DVCUser_PB')
        if (!DVCUser_PB) throw new Error('DVCUser_PB not found')

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
        const resultBuffer = callVariableForUser_PB(params)
        expect(resultBuffer).not.toBeNull()
        expect(SDKVariable_PB.decode(resultBuffer!)).toEqual({
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

    describe('protobuf type tests', () => {
        describe('variableForUser_PB', () => {
            it('should parse variableForUser_PB protobuf message', () => {
                const params = {
                    sdkKey: sdkKey,
                    variableKey: 'swagTest',
                    variableType: 0,
                    user: {
                        userId: 'asuh',
                        email: { value: 'test@devcycle.com', isNull: false },
                        name: { value: 'name', isNull: false },
                        language: { value: 'en', isNull: false },
                        country: { value: 'CA', isNull: false },
                        appBuild: { value: 610.0, isNull: false },
                        appVersion: { value: '1.0.0', isNull: false },
                        deviceModel: { value: 'NodeJS', isNull: false },
                    }
                }
                const resultBuffer = callTestVariableForUserParams_PB(params)
                expect(resultBuffer).not.toBeNull()
                expect(VariableForUserParams_PB.decode(resultBuffer!)).toEqual(params)
            })

            it('should set defaults for missing user fields', () => {
                const params = {
                    sdkKey: sdkKey,
                    variableKey: 'swagTest',
                    variableType: 0,
                    user: { userId: 'asuh' }
                }
                const resultBuffer = callTestVariableForUserParams_PB(params)
                expect(resultBuffer).not.toBeNull()
                expect(VariableForUserParams_PB.decode(resultBuffer!)).toEqual(params)
            })
        })

        describe('testDVCUser_PB', () => {
            it('should parse testDVCUser_PB protobuf message', () => {
                const user = {
                    userId: 'asuh',
                    email: { value: 'test@devcycle.com', isNull: false },
                    name: { value: 'name', isNull: false },
                    language: { value: 'en', isNull: false },
                    country: { value: 'CA', isNull: false },
                    appBuild: { value: 610.0, isNull: false },
                    appVersion: { value: '1.0.0', isNull: false },
                    deviceModel: { value: 'NodeJS', isNull: false }
                }
                const resultBuffer = callTestDVCUser_PB(user)
                expect(resultBuffer).not.toBeNull()
                expect(DVCUser_PB.decode(resultBuffer!)).toEqual(user)
            })

            it('should set defaults for missing user fields', () => {
                const user = {
                    userId: 'asuh'
                }
                const resultBuffer = callTestDVCUser_PB(user)
                expect(resultBuffer).not.toBeNull()
                expect(DVCUser_PB.decode(resultBuffer!)).toEqual({
                    userId: 'asuh',
                    email: { value: '', isNull: true },
                    name: { value: '', isNull: true },
                    language: { value: '', isNull: true },
                    country: { value: '', isNull: true },
                    appBuild: { value: 0, isNull: true },
                    appVersion: { value: '', isNull: true },
                    deviceModel: { value: '', isNull: true }
                })
            })
        })

        describe('SDKVariable_PB', () => {
            it('should parse boolean SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    _id: '615356f120ed334a6054564c',
                    type: 0,
                    key: 'bool-key',
                    boolValue: true,
                    doubleValue: 0,
                    stringValue: '',
                    evalReason: { value: '', isNull: true }
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                expect(SDKVariable_PB.decode(resultBuffer!)).toEqual(sdkVariable)
            })

            it('should parse number SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    _id: '615356f120ed334a6054564c',
                    type: 1,
                    key: 'num-key',
                    boolValue: false,
                    doubleValue: 610,
                    stringValue: ''
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                expect(SDKVariable_PB.decode(resultBuffer!)).toEqual(sdkVariable)
            })

            it('should parse string SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    _id: '615356f120ed334a6054564c',
                    type: 2,
                    key: 'string-key',
                    boolValue: false,
                    doubleValue: 0,
                    stringValue: 'string-value'
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                expect(SDKVariable_PB.decode(resultBuffer!)).toEqual(sdkVariable)
            })

            it('should parse json SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    _id: '615356f120ed334a6054564c',
                    type: 2,
                    key: 'json-key',
                    boolValue: false,
                    doubleValue: 0,
                    stringValue: '{"hello":"world"}'
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                expect(SDKVariable_PB.decode(resultBuffer!)).toEqual(sdkVariable)
            })
        })
    })
})

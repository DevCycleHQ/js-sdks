import {
    variableForUser_PB,
    variableForUser_PB_Preallocated,
    VariableType,
    testVariableForUserParams_PB,
    testDVCUser_PB,
    testSDKVariable_PB,
} from '../bucketingImportHelper'
import * as ProtobufTypes from '../../protobuf/compiled'
import {
    encodeProtobufMessage,
    decodeProtobufMessage,
} from '../../protobuf/pbHelpers'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData
import { initSDK } from '../setPlatformData'

describe('protobuf variable tests', () => {
    const sdkKey = 'sdkKey'
    const VariableForUserParams_PB = ProtobufTypes.VariableForUserParams_PB
    const DVCUser_PB = ProtobufTypes.DVCUser_PB
    const SDKVariable_PB = ProtobufTypes.SDKVariable_PB

    const callVariableForUser_PB = (params: any): Uint8Array | null => {
        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = encodeProtobufMessage(pbMsg, VariableForUserParams_PB)
        return variableForUser_PB(buffer)
    }

    const callVariableForUser_PB_Preallocated = (
        params: any,
    ): Uint8Array | null => {
        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = encodeProtobufMessage(pbMsg, VariableForUserParams_PB)
        const combinedBuffer = Buffer.concat([buffer, new Uint8Array(100)])
        return variableForUser_PB_Preallocated(combinedBuffer, buffer.length)
    }

    const callTestVariableForUserParams_PB = (
        params: any,
    ): Uint8Array | null => {
        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = encodeProtobufMessage(pbMsg, VariableForUserParams_PB)
        return testVariableForUserParams_PB(buffer)
    }

    const callTestDVCUser_PB = (user: any): Uint8Array | null => {
        const pbMsg = DVCUser_PB.create(user)
        const buffer = encodeProtobufMessage(pbMsg, DVCUser_PB)
        return testDVCUser_PB(buffer)
    }

    const callTestSDKVariable_PB = (variable: any): Uint8Array | null => {
        const pbMsg = SDKVariable_PB.create(variable)
        const buffer = encodeProtobufMessage(pbMsg, SDKVariable_PB)
        return testSDKVariable_PB(buffer)
    }

    beforeAll(() => {
        initSDK(sdkKey, config)
    })

    const varForUserParams = {
        sdkKey,
        variableKey: 'swagTest',
        variableType: 2,
        shouldTrackEvent: true,
        user: {
            userId: 'asuh',
            country: { value: 'canada', isNull: false },
            email: { value: 'test', isNull: false },
        },
    }
    const varForUserExpected = {
        Id: '615356f120ed334a6054564c',
        boolValue: false,
        doubleValue: 0,
        evalReason: {
            isNull: true,
            value: '',
        },
        key: 'swagTest',
        stringValue: 'YEEEEOWZA',
        type: VariableType.String,
    }

    it('should write protobuf message to variableForUser_PB', () => {
        console.log(`varForUserParams: ${JSON.stringify(varForUserParams)}`)
        const resultBuffer = callVariableForUser_PB(varForUserParams)
        console.log(`resultBuffer: ${resultBuffer}`)
        console.log(`resultBuffer length: ${resultBuffer?.length}`)
        expect(resultBuffer).not.toBeNull()
        const decoded = decodeProtobufMessage(resultBuffer!, SDKVariable_PB)
        console.log(`decoded: ${JSON.stringify(decoded)}`)
        expect(decoded).toEqual(varForUserExpected)
    })

    it('should write preallocated protobuf message to variableForUser_PB_Preallocated', () => {
        const resultBuffer =
            callVariableForUser_PB_Preallocated(varForUserParams)
        expect(resultBuffer).not.toBeNull()
        const decoded = decodeProtobufMessage(resultBuffer!, SDKVariable_PB)
        expect(decoded).toEqual(varForUserExpected)
    })

    describe('protobuf type tests', () => {
        describe('variableForUser_PB', () => {
            it('should parse variableForUser_PB protobuf message', () => {
                const params = {
                    sdkKey: sdkKey,
                    variableKey: 'swagTest',
                    variableType: 0,
                    shouldTrackEvent: true,
                    user: {
                        userId: 'asuh',
                        email: { value: 'test@devcycle.com', isNull: false },
                        name: { value: 'name', isNull: false },
                        language: { value: 'en', isNull: false },
                        country: { value: 'CA', isNull: false },
                        appBuild: { value: 610.0, isNull: false },
                        appVersion: { value: '1.0.0', isNull: false },
                        deviceModel: { value: 'NodeJS', isNull: false },
                        customData: {
                            value: {
                                isBatman: {
                                    type: VariableType.Boolean,
                                    boolValue: true,
                                    doubleValue: 0,
                                    stringValue: '',
                                },
                                frequency: {
                                    type: VariableType.Number,
                                    boolValue: false,
                                    doubleValue: 103.1,
                                    stringValue: '',
                                },
                            },
                            isNull: false,
                        },
                        privateCustomData: {
                            value: {
                                autoBotsMessage: {
                                    type: VariableType.String,
                                    boolValue: false,
                                    doubleValue: 0,
                                    stringValue: 'roll out!',
                                },
                                isNull: {
                                    type: 3,
                                    boolValue: false,
                                    doubleValue: 0,
                                    stringValue: '',
                                },
                            },
                            isNull: false,
                        },
                    },
                }
                const resultBuffer = callTestVariableForUserParams_PB(params)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(
                    resultBuffer!,
                    VariableForUserParams_PB,
                )
                expect(decoded).toEqual(params)
            })

            it('should set defaults for missing user fields', () => {
                const params = {
                    sdkKey: sdkKey,
                    variableKey: 'swagTest',
                    variableType: 0,
                    shouldTrackEvent: false,
                    user: {
                        userId: 'asuh',
                        customData: { value: {}, isNull: true },
                        privateCustomData: { value: {}, isNull: true },
                    },
                }
                const resultBuffer = callTestVariableForUserParams_PB(params)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(
                    resultBuffer!,
                    VariableForUserParams_PB,
                )
                expect(decoded).toEqual(params)
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
                    deviceModel: { value: 'NodeJS', isNull: false },
                    customData: {
                        value: {
                            isBatman: {
                                type: VariableType.Boolean,
                                boolValue: true,
                                doubleValue: 0,
                                stringValue: '',
                            },
                            frequency: {
                                type: VariableType.Number,
                                boolValue: false,
                                doubleValue: 103.1,
                                stringValue: '',
                            },
                        },
                        isNull: false,
                    },
                    privateCustomData: {
                        value: {
                            autoBotsMessage: {
                                type: VariableType.String,
                                boolValue: false,
                                doubleValue: 0,
                                stringValue: 'roll out!',
                            },
                            isNull: {
                                type: 3,
                                boolValue: false,
                                doubleValue: 0,
                                stringValue: '',
                            },
                        },
                        isNull: false,
                    },
                }
                const resultBuffer = callTestDVCUser_PB(user)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(resultBuffer!, DVCUser_PB)
                expect(decoded).toEqual(user)
            })

            it('should set defaults for missing user fields', () => {
                const user = {
                    userId: 'asuh',
                }
                const resultBuffer = callTestDVCUser_PB(user)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(resultBuffer!, DVCUser_PB)
                expect(decoded).toEqual({
                    userId: 'asuh',
                    email: { value: '', isNull: true },
                    name: { value: '', isNull: true },
                    language: { value: '', isNull: true },
                    country: { value: '', isNull: true },
                    appBuild: { value: 0, isNull: true },
                    appVersion: { value: '', isNull: true },
                    deviceModel: { value: '', isNull: true },
                    customData: { value: {}, isNull: true },
                    privateCustomData: { value: {}, isNull: true },
                })
            })
        })

        describe('SDKVariable_PB', () => {
            it('should parse boolean SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    Id: '615356f120ed334a6054564c',
                    type: 0,
                    key: 'bool-key',
                    boolValue: true,
                    doubleValue: 0,
                    stringValue: '',
                    evalReason: { value: '', isNull: true },
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(
                    resultBuffer!,
                    SDKVariable_PB,
                )
                expect(decoded).toEqual(sdkVariable)
            })

            it('should parse number SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    Id: '615356f120ed334a6054564c',
                    type: 1,
                    key: 'num-key',
                    boolValue: false,
                    doubleValue: 610,
                    stringValue: '',
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(
                    resultBuffer!,
                    SDKVariable_PB,
                )
                expect(decoded).toEqual(sdkVariable)
            })

            it('should parse string SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    Id: '615356f120ed334a6054564c',
                    type: 2,
                    key: 'string-key',
                    boolValue: false,
                    doubleValue: 0,
                    stringValue: 'string-value',
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(
                    resultBuffer!,
                    SDKVariable_PB,
                )
                expect(decoded).toEqual(sdkVariable)
            })

            it('should parse json SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    Id: '615356f120ed334a6054564c',
                    type: 2,
                    key: 'json-key',
                    boolValue: false,
                    doubleValue: 0,
                    stringValue: '{"hello":"world"}',
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = decodeProtobufMessage(
                    resultBuffer!,
                    SDKVariable_PB,
                )
                expect(decoded).toEqual(sdkVariable)
            })
        })
    })
})

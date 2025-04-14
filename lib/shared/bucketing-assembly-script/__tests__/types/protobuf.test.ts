import {
    variableForUser_PB,
    variableForUser_PB_Preallocated,
    VariableType,
    testVariableForUserParams_PB,
    testDVCUser_PB,
    testSDKVariable_PB,
} from '../bucketingImportHelper'
import {
    VariableForUserParams_PB,
    DVCUser_PB,
    SDKVariable_PB,
} from '../../protobuf/compiled'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData
import { initSDK } from '../setPlatformData'

describe('protobuf variable tests', () => {
    const sdkKey = 'sdkKey'

    const callVariableForUser_PB = (params: any): Uint8Array | null => {
        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = VariableForUserParams_PB.toBinary(pbMsg)
        return variableForUser_PB(buffer)
    }

    const callVariableForUser_PB_Preallocated = (
        params: any,
    ): Uint8Array | null => {
        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = VariableForUserParams_PB.toBinary(pbMsg)
        const combinedBuffer = Buffer.concat([buffer, new Uint8Array(100)])
        return variableForUser_PB_Preallocated(combinedBuffer, buffer.length)
    }

    const callTestVariableForUserParams_PB = (
        params: any,
    ): Uint8Array | null => {
        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = VariableForUserParams_PB.toBinary(pbMsg)
        return testVariableForUserParams_PB(buffer)
    }

    const callTestDVCUser_PB = (user: any): Uint8Array | null => {
        const pbMsg = DVCUser_PB.create(user)
        const buffer = DVCUser_PB.toBinary(pbMsg)
        return testDVCUser_PB(buffer)
    }

    const callTestSDKVariable_PB = (variable: any): Uint8Array | null => {
        const pbMsg = SDKVariable_PB.create(variable)
        const buffer = SDKVariable_PB.toBinary(pbMsg)
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
            user_id: 'asuh',
            country: { value: 'canada', isNull: false },
            email: { value: 'test', isNull: false },
        },
    }
    const sdkVarForUserExpected = {
        _id: '615356f120ed334a6054564c',
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

    it('should write protobuf message to buffer than read it back', () => {
        const pbMsg = VariableForUserParams_PB.create(varForUserParams)
        const buffer = VariableForUserParams_PB.toBinary(pbMsg)

        const decoded = VariableForUserParams_PB.fromBinary(buffer)
        expect(decoded).toEqual(varForUserParams)
    })

    it('should write protobuf message to variableForUser_PB', () => {
        const resultBuffer = callVariableForUser_PB(varForUserParams)
        expect(resultBuffer).not.toBeNull()
        const sdkVarDecoded = SDKVariable_PB.fromBinary(resultBuffer!)
        expect(sdkVarDecoded).toEqual(sdkVarForUserExpected)
    })

    it('should write preallocated protobuf message to variableForUser_PB_Preallocated', () => {
        const resultBuffer =
            callVariableForUser_PB_Preallocated(varForUserParams)
        expect(resultBuffer).not.toBeNull()
        const decoded = SDKVariable_PB.fromBinary(resultBuffer!)
        expect(decoded).toEqual(sdkVarForUserExpected)
    })

    describe('protobuf type tests', () => {
        describe('variableForUser_PB', () => {
            it('should throw error if data is not set on variableForUser_PB create', () => {
                expect(() =>
                    callVariableForUser_PB({
                        variableKey: 'swagTest',
                        variableType: 0,
                        shouldTrackEvent: true,
                        user: {},
                    }),
                ).toThrow('Data is not set on variableForUser_PB create')
            })

            it('should parse variableForUser_PB protobuf message', () => {
                const params = {
                    sdkKey: sdkKey,
                    variableKey: 'swagTest',
                    variableType: 0,
                    shouldTrackEvent: true,
                    user: {
                        user_id: 'asuh',
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
                const decoded = VariableForUserParams_PB.fromBinary(
                    resultBuffer!,
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
                        user_id: 'asuh',
                        customData: { value: {}, isNull: true },
                        privateCustomData: { value: {}, isNull: true },
                    },
                }
                const resultBuffer = callTestVariableForUserParams_PB(params)
                expect(resultBuffer).not.toBeNull()
                const decoded = VariableForUserParams_PB.fromBinary(
                    resultBuffer!,
                )
                expect(decoded).toEqual(params)
            })
        })

        describe('testDVCUser_PB', () => {
            it('should parse testDVCUser_PB protobuf message', () => {
                const user = {
                    user_id: 'asuh',
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
                const decoded = DVCUser_PB.fromBinary(resultBuffer!)
                expect(decoded).toEqual(user)
            })

            it('should set defaults for missing user fields', () => {
                const user = {
                    user_id: 'asuh',
                }
                const resultBuffer = callTestDVCUser_PB(user)
                expect(resultBuffer).not.toBeNull()
                const decoded = DVCUser_PB.fromBinary(resultBuffer!)
                expect(decoded).toEqual({
                    user_id: 'asuh',
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
                    _id: '615356f120ed334a6054564c',
                    type: 0,
                    key: 'bool-key',
                    boolValue: true,
                    doubleValue: 0,
                    stringValue: '',
                    evalReason: { value: '', isNull: true },
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = SDKVariable_PB.fromBinary(resultBuffer!)
                expect(decoded).toEqual(sdkVariable)
            })

            it('should parse number SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    _id: '615356f120ed334a6054564c',
                    type: 1,
                    key: 'num-key',
                    boolValue: false,
                    doubleValue: 610,
                    stringValue: '',
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = SDKVariable_PB.fromBinary(resultBuffer!)
                expect(decoded).toEqual(sdkVariable)
            })

            it('should parse string SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    _id: '615356f120ed334a6054564c',
                    type: 2,
                    key: 'string-key',
                    boolValue: false,
                    doubleValue: 0,
                    stringValue: 'string-value',
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = SDKVariable_PB.fromBinary(resultBuffer!)
                expect(decoded).toEqual(sdkVariable)
            })

            it('should parse json SDKVariable_PB protobuf message', () => {
                const sdkVariable = {
                    _id: '615356f120ed334a6054564c',
                    type: 2,
                    key: 'json-key',
                    boolValue: false,
                    doubleValue: 0,
                    stringValue: '{"hello":"world"}',
                }
                const resultBuffer = callTestSDKVariable_PB(sdkVariable)
                expect(resultBuffer).not.toBeNull()
                const decoded = SDKVariable_PB.fromBinary(resultBuffer!)
                expect(decoded).toEqual(sdkVariable)
            })
        })
    })
})

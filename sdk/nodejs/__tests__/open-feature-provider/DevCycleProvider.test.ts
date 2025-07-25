jest.mock('@devcycle/config-manager')
jest.mock('../../src/eventQueue')

const setPlatformDataMock = jest.fn()
jest.mock('../../src/bucketing', () => ({
    importBucketingLib: jest.fn().mockResolvedValue([
        {
            setPlatformData: setPlatformDataMock,
        },
        null,
    ]),
}))

import {
    OpenFeature,
    Client,
    StandardResolutionReasons,
    ProviderEvents,
} from '@openfeature/server-sdk'
import {
    DevCycleClient,
    DevCycleCloudClient,
    DevCycleProvider,
    DevCycleUser,
    DVCVariable,
    DVCVariableValue,
} from '../../src/index'
import {
    DEFAULT_REASON_DETAILS,
    EVAL_REASON_DETAILS,
    EVAL_REASONS,
} from '@devcycle/types'

const variableMock = jest.spyOn(DevCycleClient.prototype, 'variable')
const cloudVariableMock = jest.spyOn(DevCycleCloudClient.prototype, 'variable')
const trackMock = jest.spyOn(DevCycleClient.prototype, 'track')
const cloudTrackMock = jest.spyOn(DevCycleCloudClient.prototype, 'track')

const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}
type DevCycleClientTypes = 'DevCycleClient' | 'DevCycleCloudClient'

describe.each(['DevCycleClient', 'DevCycleCloudClient'])(
    'DevCycleProvider Unit Tests',
    (dvcClientType: DevCycleClientTypes) => {
        async function initOFClient(skipContext = false): Promise<{
            ofClient: Client
            dvcClient: DevCycleClient | DevCycleCloudClient
        }> {
            const provider =
                dvcClientType === 'DevCycleCloudClient'
                    ? new DevCycleProvider('dvc_server_sdk_key', {
                          logger,
                          enableCloudBucketing: true,
                      })
                    : new DevCycleProvider('dvc_server_sdk_key', { logger })

            await OpenFeature.setProviderAndWait(provider)
            const ofClient = OpenFeature.getClient()
            if (!skipContext) {
                ofClient.setContext({ targetingKey: 'node_sdk_test' })
            }

            return { ofClient, dvcClient: provider.devcycleClient }
        }

        function mockVariable(variable: DVCVariable<DVCVariableValue>) {
            if (dvcClientType === 'DevCycleClient') {
                variableMock.mockReturnValue(variable)
            } else {
                cloudVariableMock.mockResolvedValue(variable)
            }
        }

        beforeEach(() => {
            variableMock.mockReset()
            cloudVariableMock.mockReset()
        })

        afterEach(async () => {
            variableMock.mockReset()
            cloudVariableMock.mockReset()
            await OpenFeature.close()
        })

        it(`${dvcClientType} - should setup an OpenFeature provider with a DVCUserClient`, async () => {
            const { ofClient, dvcClient } = await initOFClient()

            expect(ofClient).toBeDefined()
            expect(dvcClient).toBeDefined()
            expect(setPlatformDataMock).toHaveBeenCalledWith(
                expect.stringContaining('"sdkPlatform":"nodejs-of"'),
            )
        })

        describe(`${dvcClientType} - User Context`, () => {
            beforeEach(() => {
                mockVariable({
                    key: 'boolean-flag',
                    value: true,
                    defaultValue: false,
                    isDefaulted: false,
                    type: 'Boolean',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: EVAL_REASON_DETAILS.EMAIL,
                        target_id: 'target_id',
                    },
                })
            })

            it('should throw error if targetingKey is missing', async () => {
                const { ofClient } = await initOFClient()

                ofClient.setContext({})
                expect(
                    ofClient.getBooleanDetails('boolean-flag', false),
                ).resolves.toEqual({
                    flagKey: 'boolean-flag',
                    value: false,
                    errorCode: 'TARGETING_KEY_MISSING',
                    errorMessage:
                        'DevCycle: Evaluation context does not contain a valid ' +
                        'targetingKey, user_id, or userId string attribute',
                    reason: 'ERROR',
                    flagMetadata: {},
                })
            })

            it('should throw error if targetingKey is not a string', async () => {
                const { ofClient } = await initOFClient()

                ofClient.setContext({ user_id: 123 })
                expect(
                    ofClient.getBooleanDetails('boolean-flag', false),
                ).resolves.toEqual({
                    flagKey: 'boolean-flag',
                    value: false,
                    errorCode: 'TARGETING_KEY_MISSING',
                    errorMessage:
                        'DevCycle: user_id must be a string, got number',
                    reason: 'ERROR',
                    flagMetadata: {},
                })
            })

            it('should use targetingKey as user_id when present (highest priority)', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    targetingKey: 'targeting-key-user',
                    user_id: 'user_id-user',
                    userId: 'userId-user',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({ user_id: 'targeting-key-user' }),
                    'boolean-flag',
                    false,
                )
            })

            it('should use user_id when targetingKey is missing (second priority)', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    user_id: 'user_id-user',
                    userId: 'userId-user',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({ user_id: 'user_id-user' }),
                    'boolean-flag',
                    false,
                )
            })

            it('should use userId when targetingKey and user_id are missing (lowest priority)', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    userId: 'userId-user',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({ user_id: 'userId-user' }),
                    'boolean-flag',
                    false,
                )
            })

            it('should use user_id over userId when targetingKey is empty string', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    targetingKey: '',
                    user_id: 'user_id-user',
                    userId: 'userId-user',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({ user_id: 'user_id-user' }),
                    'boolean-flag',
                    false,
                )
            })

            it('should use userId when both targetingKey and user_id are empty strings', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    targetingKey: '',
                    user_id: '',
                    userId: 'userId-user',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({ user_id: 'userId-user' }),
                    'boolean-flag',
                    false,
                )
            })

            it('should exclude userId from custom data when used as user_id', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    userId: 'userId-user',
                    customProp: 'custom-value',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({
                        user_id: 'userId-user',
                        customData: { customProp: 'custom-value' },
                    }),
                    'boolean-flag',
                    false,
                )
            })

            it('should include userId in custom data when not used as user_id (wrong type)', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    targetingKey: 'targeting-key-user',
                    userId: 123, // wrong type, should be included in custom data
                    customProp: 'custom-value',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({
                        user_id: 'targeting-key-user',
                        customData: {
                            customProp: 'custom-value',
                        },
                    }),
                    'boolean-flag',
                    false,
                )
            })

            it('should include userId in custom data when not used as user_id (lower priority)', async () => {
                const { ofClient, dvcClient } = await initOFClient()

                ofClient.setContext({
                    user_id: 'user_id-user',
                    userId: 'userId-user', // lower priority, should be included in custom data
                    customProp: 'custom-value',
                })

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({
                        user_id: 'user_id-user',
                        customData: {
                            customProp: 'custom-value',
                        },
                    }),
                    'boolean-flag',
                    false,
                )
            })

            it('should convert Context properties to DevCycleUser properties', async () => {
                const { ofClient, dvcClient } = await initOFClient()
                const dvcUser = {
                    user_id: 'user_id',
                    email: 'email',
                    name: 'name',
                    language: 'en',
                    country: 'CA',
                    appVersion: '1.0.11',
                    appBuild: 1000,
                    customData: { custom: 'data' },
                    privateCustomData: { private: 'data' },
                }
                ofClient.setContext(dvcUser)

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser(dvcUser),
                    'boolean-flag',
                    false,
                )
            })

            it('should skip DevCycleUser properties that are not the correct type', async () => {
                const { ofClient, dvcClient } = await initOFClient()
                const dvcUser = {
                    user_id: 'user_id',
                    appVersion: 1.0,
                    appBuild: 'string',
                    customData: 'data',
                }
                ofClient.setContext(dvcUser)

                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)

                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({ user_id: 'user_id' }),
                    'boolean-flag',
                    false,
                )
                expect(logger.warn).toHaveBeenCalledWith(
                    'Expected DevCycleUser property "appVersion" to be "string" but got "number" in ' +
                        'EvaluationContext. Ignoring value.',
                )
                expect(logger.warn).toHaveBeenCalledWith(
                    'Expected DevCycleUser property "appBuild" to be "number" but got "string" in ' +
                        'EvaluationContext. Ignoring value.',
                )
                expect(logger.warn).toHaveBeenCalledWith(
                    'Expected DevCycleUser property "customData" to be "object" but got "string" in ' +
                        'EvaluationContext. Ignoring value.',
                )
            })

            it(
                'should skip Context properties that are sub-objects as ' +
                    'DevCycleUser only supports flat properties',
                async () => {
                    const { ofClient, dvcClient } = await initOFClient()
                    const dvcUser = {
                        user_id: 'user_id',
                        nullKey: null,
                        obj: { key: 'value' },
                    }
                    ofClient.setContext(dvcUser)

                    await expect(
                        ofClient.getBooleanValue('boolean-flag', false),
                    ).resolves.toEqual(true)

                    expect(dvcClient.variable).toHaveBeenCalledWith(
                        new DevCycleUser({
                            user_id: 'user_id',
                            customData: { nullKey: null },
                        }),
                        'boolean-flag',
                        false,
                    )
                    expect(logger.warn).toHaveBeenCalledWith(
                        'EvaluationContext property "obj" is an Object. ' +
                            'DevCycleUser only supports flat customData properties of type ' +
                            'string / number / boolean / null',
                    )
                },
            )

            it('should skip customData key that is not a flat json property', async () => {
                const { ofClient, dvcClient } = await initOFClient()
                const dvcUser = {
                    user_id: 'user_id',
                    customData: { obj: { key: 'value' }, num: 610 },
                }
                ofClient.setContext(dvcUser)
                await expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
                expect(dvcClient.variable).toHaveBeenCalledWith(
                    new DevCycleUser({
                        user_id: 'user_id',
                        customData: { num: 610 },
                    }),
                    'boolean-flag',
                    false,
                )
                expect(logger.warn).toHaveBeenCalledWith(
                    'EvaluationContext property "customData" contains "obj" property of type ' +
                        'object. DevCycleUser only supports flat customData properties of type ' +
                        'string / number / boolean / null',
                )
            })
        })
        describe(`${dvcClientType} - Eval Reasons`, () => {
            it('should return reason TARGETING_MATCH if eval is null and isDefaulted is false', async () => {
                mockVariable({
                    key: 'boolean-flag',
                    value: true,
                    defaultValue: false,
                    isDefaulted: false,
                    type: 'Boolean',
                })
                const { ofClient } = await initOFClient()
                expect(
                    ofClient.getBooleanDetails('boolean-flag', false),
                ).resolves.toEqual({
                    flagKey: 'boolean-flag',
                    value: true,
                    reason: StandardResolutionReasons.TARGETING_MATCH,
                    flagMetadata: {},
                })
            })
            it('should return reason DEFAULT if eval is null and isDefaulted is true', async () => {
                mockVariable({
                    key: 'boolean-flag',
                    value: false,
                    defaultValue: false,
                    isDefaulted: true,
                    type: 'Boolean',
                })
                const { ofClient } = await initOFClient()
                expect(
                    ofClient.getBooleanDetails('boolean-flag', false),
                ).resolves.toEqual({
                    flagKey: 'boolean-flag',
                    value: false,
                    reason: StandardResolutionReasons.DEFAULT,
                    flagMetadata: {},
                })
            })
            it('should return reason specified in eval if it exists', async () => {
                mockVariable({
                    key: 'boolean-flag',
                    value: true,
                    defaultValue: false,
                    isDefaulted: true,
                    type: 'Boolean',
                    eval: {
                        reason: EVAL_REASONS.SPLIT,
                        details: EVAL_REASON_DETAILS.ROLLOUT,
                        target_id: 'target_id',
                    },
                })
                const { ofClient } = await initOFClient()
                expect(
                    ofClient.getBooleanDetails('boolean-flag', false),
                ).resolves.toEqual({
                    flagKey: 'boolean-flag',
                    value: true,
                    reason: StandardResolutionReasons.SPLIT,
                    flagMetadata: {
                        evalReasonDetails: 'Rollout',
                        evalReasonTargetId: 'target_id',
                    },
                })
            })
        })
        describe(`${dvcClientType} - Boolean Flags`, () => {
            beforeEach(() => {
                mockVariable({
                    key: 'boolean-flag',
                    value: true,
                    defaultValue: false,
                    isDefaulted: false,
                    type: 'Boolean',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: EVAL_REASON_DETAILS.ROLLOUT,
                        target_id: 'target_id',
                    },
                })
            })

            it('should resolve a boolean flag value', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getBooleanValue('boolean-flag', false),
                ).resolves.toEqual(true)
            })

            it('should resolve a boolean flag details', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getBooleanDetails('boolean-flag', false),
                ).resolves.toEqual({
                    flagKey: 'boolean-flag',
                    value: true,
                    reason: StandardResolutionReasons.TARGETING_MATCH,
                    flagMetadata: {
                        evalReasonDetails: 'Rollout',
                        evalReasonTargetId: 'target_id',
                    },
                })
            })

            it('should return default value if flag is not found', async () => {
                mockVariable({
                    key: 'boolean-flag',
                    value: false,
                    defaultValue: false,
                    isDefaulted: true,
                    type: 'Boolean',
                    eval: {
                        reason: EVAL_REASONS.DEFAULT,
                        details: DEFAULT_REASON_DETAILS.USER_NOT_TARGETED,
                    },
                })
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getBooleanDetails('boolean-flag', false),
                ).resolves.toEqual({
                    flagKey: 'boolean-flag',
                    value: false,
                    reason: StandardResolutionReasons.DEFAULT,
                    flagMetadata: {
                        evalReasonDetails: 'User Not Targeted',
                    },
                })
            })
        })

        describe(`${dvcClientType} - String Flags`, () => {
            beforeEach(() => {
                mockVariable({
                    key: 'string-flag',
                    value: 'string-value',
                    defaultValue: 'string-default',
                    isDefaulted: false,
                    type: 'String',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: EVAL_REASON_DETAILS.ROLLOUT,
                        target_id: 'target_id',
                    },
                })
            })

            it('should resolve a string flag value', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getStringValue('string-flag', 'string-default'),
                ).resolves.toEqual('string-value')
            })

            it('should resolve a string flag details', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getStringDetails('string-flag', 'string-default'),
                ).resolves.toEqual({
                    flagKey: 'string-flag',
                    value: 'string-value',
                    reason: StandardResolutionReasons.TARGETING_MATCH,
                    flagMetadata: {
                        evalReasonDetails: 'Rollout',
                        evalReasonTargetId: 'target_id',
                    },
                })
            })
        })

        describe(`${dvcClientType} - Number Flags`, () => {
            beforeEach(() => {
                mockVariable({
                    key: 'num-flag',
                    value: 610,
                    defaultValue: 2056,
                    isDefaulted: false,
                    type: 'Number',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: EVAL_REASON_DETAILS.ROLLOUT,
                        target_id: 'target_id',
                    },
                })
            })

            it('should resolve a number flag value', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getNumberValue('num-flag', 2056),
                ).resolves.toEqual(610)
            })

            it('should resolve a number flag details', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getNumberDetails('num-flag', 2056),
                ).resolves.toEqual({
                    flagKey: 'num-flag',
                    value: 610,
                    reason: StandardResolutionReasons.TARGETING_MATCH,
                    flagMetadata: {
                        evalReasonDetails: 'Rollout',
                        evalReasonTargetId: 'target_id',
                    },
                })
            })
        })

        describe(`${dvcClientType} - JSON Flags`, () => {
            beforeEach(() => {
                mockVariable({
                    key: 'json-flag',
                    value: { hello: 'world' },
                    defaultValue: { default: 'value' },
                    isDefaulted: false,
                    type: 'JSON',
                    eval: {
                        reason: EVAL_REASONS.TARGETING_MATCH,
                        details: EVAL_REASON_DETAILS.ROLLOUT,
                        target_id: 'target_id',
                    },
                })
            })

            it('should resolve a string flag value', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getObjectValue('json-flag', { default: 'value' }),
                ).resolves.toEqual({ hello: 'world' })
            })

            it('should resolve a boolean flag details', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getObjectDetails('json-flag', {
                        default: 'value',
                    }),
                ).resolves.toEqual({
                    flagKey: 'json-flag',
                    value: { hello: 'world' },
                    reason: StandardResolutionReasons.TARGETING_MATCH,
                    flagMetadata: {
                        evalReasonDetails: 'Rollout',
                        evalReasonTargetId: 'target_id',
                    },
                })
            })

            it('should return default value if json default is not an object', async () => {
                const { ofClient } = await initOFClient()

                expect(
                    ofClient.getObjectDetails('json-flag', ['arry']),
                ).resolves.toEqual({
                    flagKey: 'json-flag',
                    value: ['arry'],
                    reason: 'ERROR',
                    errorCode: 'PARSE_ERROR',
                    errorMessage:
                        'DevCycle only supports object values for JSON flags',
                    flagMetadata: {},
                })
                expect(
                    ofClient.getObjectDetails('json-flag', 610),
                ).resolves.toEqual({
                    flagKey: 'json-flag',
                    value: 610,
                    reason: 'ERROR',
                    errorCode: 'PARSE_ERROR',
                    errorMessage:
                        'DevCycle only supports object values for JSON flags',
                    flagMetadata: {},
                })
                expect(
                    ofClient.getObjectDetails('json-flag', 'string'),
                ).resolves.toEqual({
                    flagKey: 'json-flag',
                    value: 'string',
                    reason: 'ERROR',
                    errorCode: 'PARSE_ERROR',
                    errorMessage:
                        'DevCycle only supports object values for JSON flags',
                    flagMetadata: {},
                })
                expect(
                    ofClient.getObjectDetails('json-flag', false),
                ).resolves.toEqual({
                    flagKey: 'json-flag',
                    value: false,
                    reason: 'ERROR',
                    errorCode: 'PARSE_ERROR',
                    errorMessage:
                        'DevCycle only supports object values for JSON flags',
                    flagMetadata: {},
                })
                expect(
                    ofClient.getObjectDetails('json-flag', null),
                ).resolves.toEqual({
                    flagKey: 'json-flag',
                    value: null,
                    reason: 'ERROR',
                    errorCode: 'PARSE_ERROR',
                    errorMessage:
                        'DevCycle does not support null default values for JSON flags',
                    flagMetadata: {},
                })
            })
        })

        describe(`${dvcClientType} - Tracking`, () => {
            beforeEach(() => {
                trackMock.mockClear()
                cloudTrackMock.mockClear()
            })

            it('should track an event with value and metadata', async () => {
                const { ofClient } = await initOFClient()
                const trackingData = {
                    value: 123,
                    customField: 'custom value',
                }

                ofClient.track(
                    'test-event',
                    { targetingKey: 'user-123' },
                    trackingData,
                )

                const expectedTrackCall = {
                    type: 'test-event',
                    value: 123,
                    metaData: {
                        customField: 'custom value',
                    },
                }

                if (dvcClientType === 'DevCycleClient') {
                    expect(trackMock).toHaveBeenCalledWith(
                        expect.any(DevCycleUser),
                        expectedTrackCall,
                    )
                } else {
                    expect(cloudTrackMock).toHaveBeenCalledWith(
                        expect.any(DevCycleUser),
                        expectedTrackCall,
                    )
                }
            })

            it('should track an event without value or metadata', async () => {
                const { ofClient } = await initOFClient()

                ofClient.track('test-event', {
                    targetingKey: 'user-123',
                })

                const expectedTrackCall = expect.objectContaining({
                    type: 'test-event',
                })

                if (dvcClientType === 'DevCycleClient') {
                    expect(trackMock).toHaveBeenCalledWith(
                        expect.any(DevCycleUser),
                        expectedTrackCall,
                    )
                } else {
                    expect(cloudTrackMock).toHaveBeenCalledWith(
                        expect.any(DevCycleUser),
                        expectedTrackCall,
                    )
                }
            })

            it('should throw error if context is missing', async () => {
                const { ofClient } = await initOFClient()

                ofClient.addHandler(ProviderEvents.Error, (error) => {
                    expect(error?.message).toBe('Missing context')
                })
                ofClient.track('test-event')
            })

            it('should throw error if targetingKey is missing', async () => {
                const { ofClient } = await initOFClient()

                ofClient.addHandler(ProviderEvents.Error, (error) => {
                    expect(error?.message).toBe(
                        'DevCycle: Evaluation context does not contain a valid ' +
                            'targetingKey, user_id, or userId string attribute',
                    )
                })
                ofClient.track('test-event', {})
            })

            it('should track using targetingKey as user_id (highest priority)', async () => {
                const { ofClient } = await initOFClient(true)

                ofClient.track('test-event', {
                    targetingKey: 'targeting-key-user',
                    user_id: 'user_id-user',
                    userId: 'userId-user',
                })

                const expectedTrackCall = expect.objectContaining({
                    type: 'test-event',
                })

                if (dvcClientType === 'DevCycleClient') {
                    expect(trackMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                            user_id: 'targeting-key-user',
                        }),
                        expectedTrackCall,
                    )
                } else {
                    expect(cloudTrackMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                            user_id: 'targeting-key-user',
                        }),
                        expectedTrackCall,
                    )
                }
            })

            it('should track using user_id when targetingKey is missing (second priority)', async () => {
                const { ofClient } = await initOFClient(true)

                ofClient.track('test-event', {
                    user_id: 'user_id-user',
                    userId: 'userId-user',
                })

                const expectedTrackCall = expect.objectContaining({
                    type: 'test-event',
                })

                if (dvcClientType === 'DevCycleClient') {
                    expect(trackMock).toHaveBeenCalledWith(
                        expect.objectContaining({ user_id: 'user_id-user' }),
                        expectedTrackCall,
                    )
                } else {
                    expect(cloudTrackMock).toHaveBeenCalledWith(
                        expect.objectContaining({ user_id: 'user_id-user' }),
                        expectedTrackCall,
                    )
                }
            })

            it('should track using userId when targetingKey and user_id are missing (lowest priority)', async () => {
                const { ofClient } = await initOFClient(true)

                ofClient.track('test-event', {
                    userId: 'userId-user',
                })

                const expectedTrackCall = expect.objectContaining({
                    type: 'test-event',
                })

                if (dvcClientType === 'DevCycleClient') {
                    expect(trackMock).toHaveBeenCalledWith(
                        expect.objectContaining({ user_id: 'userId-user' }),
                        expectedTrackCall,
                    )
                } else {
                    expect(cloudTrackMock).toHaveBeenCalledWith(
                        expect.objectContaining({ user_id: 'userId-user' }),
                        expectedTrackCall,
                    )
                }
            })
        })
    },
)

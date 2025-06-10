global.fetch = jest.fn()
import { EVAL_REASONS } from '@devcycle/types'
import DevCycleReactProvider from '../src/index'
import {
    Client,
    OpenFeature,
    StandardResolutionReasons,
} from '@openfeature/web-sdk'

let variableMock: any
let identifyUserMock: any
let isInitializedMock: any

const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}

async function initOFClient(): Promise<{
    ofClient: Client
    provider: DevCycleReactProvider
}> {
    const options = { logger }
    OpenFeature.setContext({ targetingKey: 'node_sdk_test' })
    const provider = new DevCycleReactProvider('dvc_client_sdk_key', options)
    await OpenFeature.setProviderAndWait(provider)

    if (provider.devcycleClient) {
        isInitializedMock = jest
            .spyOn(provider.devcycleClient, 'isInitialized', 'get')
            .mockReturnValue(true)
        identifyUserMock = jest
            .spyOn(provider.devcycleClient, 'identifyUser')
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .mockResolvedValue({})
        variableMock = jest
            .spyOn(provider.devcycleClient, 'variable')
            .mockReturnValue({
                key: 'boolean-flag',
                value: true,
                defaultValue: false,
                isDefaulted: false,
                eval: {
                    reason: EVAL_REASONS.TARGETING_MATCH,
                },
                onUpdate: jest.fn(),
            })
    }
    const ofClient = OpenFeature.getClient()
    return { ofClient, provider }
}

describe('DevCycleReactProvider Unit Tests', () => {
    afterEach(() => {
        variableMock?.mockClear()
        identifyUserMock?.mockClear()
        isInitializedMock?.mockClear()
    })

    it('should setup an OpenFeature provider with a DevCycleClient', async () => {
        const { ofClient, provider } = await initOFClient()
        expect(ofClient).toBeDefined()
        expect(provider).toBeDefined()
        expect(provider.devcycleClient).toBeDefined()
    })

    describe('User Context', () => {
        // OF doesn't expose context errors to the user through a handler / hook yet.
        // This is likely to change in future versions based off slack discussions.
        //
        // it('should throw error if targetingKey is missing', async () => {
        //     const { ofClient } = await initOFClient()
        //     variableMock.mockReturnValue({
        //         key: 'boolean-flag',
        //         value: false,
        //         defaultValue: false,
        //         isDefaulted: true,
        //         evalReason: undefined,
        //         onUpdate: jest.fn(),
        //     })
        //
        //     await OpenFeature.setContext({})
        //
        //     expect(errHandler).toHaveBeenCalled()
        //     expect(errHook).toHaveBeenCalled()
        //
        //     const details = ofClient.getBooleanDetails('boolean-flag', false)
        //     expect(details).toEqual({
        //         flagKey: 'boolean-flag',
        //         value: false,
        //         errorCode: 'TARGETING_KEY_MISSING',
        //         errorMessage: 'Missing targetingKey or user_id in context',
        //         reason: 'ERROR',
        //         flagMetadata: {},
        //     })
        // })
        //
        // it('should throw error if targetingKey is not a string', async () => {
        //     const { ofClient } = await initOFClient()
        //     await OpenFeature.setContext({ user_id: 123 })
        //
        //     expect(ofClient.getBooleanDetails('boolean-flag', false)).toEqual({
        //         flagKey: 'boolean-flag',
        //         value: false,
        //         errorCode: 'INVALID_CONTEXT',
        //         errorMessage: 'targetingKey or user_id must be a string',
        //         reason: 'ERROR',
        //         flagMetadata: {},
        //     })
        // })

        it('should convert Context properties to DevCycleUser properties', async () => {
            const { ofClient, provider } = await initOFClient()
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
            await OpenFeature.setContext(dvcUser)

            expect(ofClient.getBooleanValue('boolean-flag', false)).toEqual(
                true,
            )
            expect(provider.devcycleClient?.identifyUser).toHaveBeenCalledWith(
                dvcUser,
            )
            expect(provider.devcycleClient?.variable).toHaveBeenCalledWith(
                'boolean-flag',
                false,
            )
        })

        it('should skip DevCycleUser properties that are not the correct type', async () => {
            const { ofClient, provider } = await initOFClient()
            const dvcUser = {
                user_id: 'user_id',
                appVersion: 1.0,
                appBuild: 'string',
                customData: 'data',
            }
            await OpenFeature.setContext(dvcUser)

            expect(ofClient.getBooleanValue('boolean-flag', false)).toEqual(
                true,
            )

            expect(provider.devcycleClient?.identifyUser).toHaveBeenCalledWith({
                user_id: 'user_id',
            })
            expect(provider.devcycleClient?.variable).toHaveBeenCalledWith(
                'boolean-flag',
                false,
            )
            expect(logger.warn).toHaveBeenCalledWith(
                'Expected DevCycleUser property "appVersion" to be "string" but got "number" in EvaluationContext. ' +
                    'Ignoring value.',
            )
            expect(logger.warn).toHaveBeenCalledWith(
                'Expected DevCycleUser property "appBuild" to be "number" but got "string" in EvaluationContext. ' +
                    'Ignoring value.',
            )
            expect(logger.warn).toHaveBeenCalledWith(
                'Expected DevCycleUser property "customData" to be "object" but got "string" in EvaluationContext. ' +
                    'Ignoring value.',
            )
        })

        it(
            'should skip Context properties that are sub-objects as DevCycleUser ' +
                'only supports flat properties',
            async () => {
                const { ofClient, provider } = await initOFClient()
                const dvcUser = {
                    user_id: 'user_id',
                    nullKey: null,
                    obj: { key: 'value' },
                }
                await OpenFeature.setContext(dvcUser)

                expect(ofClient.getBooleanValue('boolean-flag', false)).toEqual(
                    true,
                )

                expect(
                    provider.devcycleClient?.identifyUser,
                ).toHaveBeenCalledWith({
                    user_id: 'user_id',
                    customData: { nullKey: null },
                })
                expect(provider.devcycleClient?.variable).toHaveBeenCalledWith(
                    'boolean-flag',
                    false,
                )
                expect(logger.warn).toHaveBeenCalledWith(
                    'Unknown EvaluationContext property "obj" type. ' +
                        'DevCycleUser only supports flat customData properties of type ' +
                        'string / number / boolean / null',
                )
            },
        )

        it('should skip customData key that is not a flat json property', async () => {
            const { ofClient, provider } = await initOFClient()
            const dvcUser = {
                user_id: 'user_id',
                customData: { obj: { key: 'value' }, num: 610 },
            }
            await OpenFeature.setContext(dvcUser)
            expect(ofClient.getBooleanValue('boolean-flag', false)).toEqual(
                true,
            )

            expect(provider.devcycleClient?.identifyUser).toHaveBeenCalledWith({
                user_id: 'user_id',
                customData: { num: 610 },
            })
            expect(provider.devcycleClient?.variable).toHaveBeenCalledWith(
                'boolean-flag',
                false,
            )
            expect(logger.warn).toHaveBeenCalledWith(
                'EvaluationContext property "customData" contains "obj" property of type object.' +
                    'DevCycleUser only supports flat customData properties of type string / number / boolean / null',
            )
        })
    })

    describe('Boolean Flags', () => {
        it('should resolve a boolean flag value', async () => {
            const { ofClient } = await initOFClient()
            expect(ofClient.getBooleanValue('boolean-flag', false)).toEqual(
                true,
            )
        })

        it('should resolve a boolean flag details', async () => {
            const { ofClient } = await initOFClient()
            expect(ofClient.getBooleanDetails('boolean-flag', false)).toEqual({
                flagKey: 'boolean-flag',
                value: true,
                reason: StandardResolutionReasons.TARGETING_MATCH,
                flagMetadata: {},
            })
        })

        it('should return default value if flag is not found', async () => {
            const { ofClient } = await initOFClient()
            variableMock.mockReturnValue({
                key: 'boolean-flag',
                value: false,
                defaultValue: false,
                isDefaulted: true,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })

            expect(ofClient.getBooleanDetails('boolean-flag', false)).toEqual({
                flagKey: 'boolean-flag',
                value: false,
                reason: StandardResolutionReasons.DEFAULT,
                flagMetadata: {},
            })
        })
    })

    describe('String Flags', () => {
        let openFeatureClient: Client
        beforeEach(async () => {
            const { ofClient } = await initOFClient()
            openFeatureClient = ofClient

            variableMock.mockReturnValue({
                key: 'string-flag',
                value: 'string-value',
                defaultValue: 'string-default',
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
        })

        it('should resolve a string flag value', async () => {
            expect(
                openFeatureClient.getStringValue(
                    'string-flag',
                    'string-default',
                ),
            ).toEqual('string-value')
        })

        it('should resolve a string flag details', async () => {
            expect(
                openFeatureClient.getStringDetails(
                    'string-flag',
                    'string-default',
                ),
            ).toEqual({
                flagKey: 'string-flag',
                value: 'string-value',
                reason: StandardResolutionReasons.TARGETING_MATCH,
                flagMetadata: {},
            })
        })
    })

    describe('Number Flags', () => {
        let openFeatureClient: Client
        beforeEach(async () => {
            const { ofClient } = await initOFClient()
            openFeatureClient = ofClient

            variableMock.mockReturnValue({
                key: 'num-flag',
                value: 610,
                defaultValue: 2056,
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
        })

        it('should resolve a number flag value', async () => {
            expect(openFeatureClient.getNumberValue('num-flag', 2056)).toEqual(
                610,
            )
        })

        it('should resolve a number flag details', async () => {
            expect(
                openFeatureClient.getNumberDetails('num-flag', 2056),
            ).toEqual({
                flagKey: 'num-flag',
                value: 610,
                reason: StandardResolutionReasons.TARGETING_MATCH,
                flagMetadata: {},
            })
        })
    })

    describe('JSON Flags', () => {
        let openFeatureClient: Client
        beforeEach(async () => {
            const { ofClient } = await initOFClient()
            openFeatureClient = ofClient

            variableMock.mockReturnValue({
                key: 'json-flag',
                value: { hello: 'world' },
                defaultValue: { default: 'value' },
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
        })

        it('should resolve a json flag value', async () => {
            expect(
                openFeatureClient.getObjectValue('json-flag', {
                    default: 'value',
                }),
            ).toEqual({ hello: 'world' })
        })

        it('should resolve a json flag details', async () => {
            expect(
                openFeatureClient.getObjectDetails('json-flag', {
                    default: 'value',
                }),
            ).toEqual({
                flagKey: 'json-flag',
                value: { hello: 'world' },
                reason: StandardResolutionReasons.TARGETING_MATCH,
                flagMetadata: {},
            })
        })

        it('should return default value if json default is not an object', async () => {
            expect(
                openFeatureClient.getObjectDetails('json-flag', ['arry']),
            ).toEqual({
                flagKey: 'json-flag',
                value: ['arry'],
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(
                openFeatureClient.getObjectDetails('json-flag', 610),
            ).toEqual({
                flagKey: 'json-flag',
                value: 610,
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(
                openFeatureClient.getObjectDetails('json-flag', 'string'),
            ).toEqual({
                flagKey: 'json-flag',
                value: 'string',
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(
                openFeatureClient.getObjectDetails('json-flag', false),
            ).toEqual({
                flagKey: 'json-flag',
                value: false,
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(
                openFeatureClient.getObjectDetails('json-flag', null),
            ).toEqual({
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

    describe('Tracking Events', () => {
        let trackMock: any
        let openFeatureClient: Client
        let provider: DevCycleReactProvider

        beforeEach(async () => {
            const init = await initOFClient()
            openFeatureClient = init.ofClient
            provider = init.provider

            if (provider.devcycleClient) {
                trackMock = jest
                    .spyOn(provider.devcycleClient, 'track')
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    .mockResolvedValue()
            }
        })

        afterEach(() => {
            trackMock?.mockClear()
        })

        it('should track an event with just a name', () => {
            openFeatureClient.track('event-name')

            expect(trackMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'event-name',
                }),
            )
        })

        it('should track an event with value and metadata', () => {
            openFeatureClient.track('event-name', {
                value: 123,
                someKey: 'someValue',
                otherKey: true,
            })

            expect(trackMock).toHaveBeenCalledWith({
                type: 'event-name',
                value: 123,
                metaData: {
                    someKey: 'someValue',
                    otherKey: true,
                },
            })
        })

        it('should track an event with just metadata', () => {
            openFeatureClient.track('event-name', {
                someKey: 'someValue',
            })

            expect(trackMock).toHaveBeenCalledWith({
                type: 'event-name',
                value: undefined,
                metaData: {
                    someKey: 'someValue',
                },
            })
        })
    })
})

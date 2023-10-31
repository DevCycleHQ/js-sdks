import DevCycleProvider from '../src/DevCycleProvider'
import {
    Client,
    OpenFeature,
    StandardResolutionReasons,
} from '@openfeature/web-sdk'
import { DevCycleClient } from '@devcycle/js-client-sdk'

jest.mock('@devcycle/nodejs-server-sdk')

const variableMock = jest.spyOn(DevCycleClient.prototype, 'variable')
const identifyUserMock = jest.spyOn(DevCycleClient.prototype, 'identifyUser')
const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}

async function initOFClient(): Promise<{
    ofClient: Client
    provider: DevCycleProvider
}> {
    const options = { logger }
    OpenFeature.setContext({ targetingKey: 'node_sdk_test' })
    const provider = new DevCycleProvider('DVC_SERVER_SDK_KEY', options)
    await OpenFeature.setProviderAndWait(provider)
    const ofClient = OpenFeature.getClient()
    return { ofClient, provider }
}

describe('DevCycleProvider Unit Tests', () => {
    beforeEach(() => {
        variableMock.mockClear()
        identifyUserMock.mockClear()
    })

    it('should setup an OpenFeature provider with a DevCycleClient', async () => {
        const { ofClient, provider } = await initOFClient()
        expect(ofClient).toBeDefined()
        expect(provider).toBeDefined()
        expect(provider.DevcycleClient).toBeDefined()
    })

    describe('User Context', () => {
        beforeEach(() => {
            variableMock.mockReturnValue({
                key: 'boolean-flag',
                value: true,
                defaultValue: false,
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            identifyUserMock.mockResolvedValue({})
        })

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
            expect(provider.DevcycleClient?.identifyUser).toHaveBeenCalledWith(
                dvcUser,
            )
            expect(provider.DevcycleClient?.variable).toHaveBeenCalledWith(
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

            expect(provider.DevcycleClient?.identifyUser).toHaveBeenCalledWith({
                user_id: 'user_id',
            })
            expect(provider.DevcycleClient?.variable).toHaveBeenCalledWith(
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
                    provider.DevcycleClient?.identifyUser,
                ).toHaveBeenCalledWith({
                    user_id: 'user_id',
                    customData: { nullKey: null },
                })
                expect(provider.DevcycleClient?.variable).toHaveBeenCalledWith(
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
            const { ofClient, provider } = await initOFClient()
            const dvcUser = {
                user_id: 'user_id',
                customData: { obj: { key: 'value' }, num: 610 },
            }
            await OpenFeature.setContext(dvcUser)
            expect(ofClient.getBooleanValue('boolean-flag', false)).toEqual(
                true,
            )

            expect(provider.DevcycleClient?.identifyUser).toHaveBeenCalledWith({
                user_id: 'user_id',
                customData: { num: 610 },
            })
            expect(provider.DevcycleClient?.variable).toHaveBeenCalledWith(
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
        beforeEach(() => {
            variableMock.mockReturnValue({
                key: 'boolean-flag',
                value: true,
                defaultValue: false,
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            identifyUserMock.mockResolvedValue({})
        })

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
            variableMock.mockReturnValue({
                key: 'boolean-flag',
                value: false,
                defaultValue: false,
                isDefaulted: true,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })

            const { ofClient } = await initOFClient()
            expect(ofClient.getBooleanDetails('boolean-flag', false)).toEqual({
                flagKey: 'boolean-flag',
                value: false,
                reason: StandardResolutionReasons.DEFAULT,
                flagMetadata: {},
            })
        })
    })

    describe('String Flags', () => {
        beforeEach(() => {
            variableMock.mockReturnValue({
                key: 'string-flag',
                value: 'string-value',
                defaultValue: 'string-default',
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            identifyUserMock.mockResolvedValue({})
        })

        it('should resolve a string flag value', async () => {
            const { ofClient } = await initOFClient()
            expect(
                ofClient.getStringValue('string-flag', 'string-default'),
            ).toEqual('string-value')
        })

        it('should resolve a string flag details', async () => {
            const { ofClient } = await initOFClient()
            expect(
                ofClient.getStringDetails('string-flag', 'string-default'),
            ).toEqual({
                flagKey: 'string-flag',
                value: 'string-value',
                reason: StandardResolutionReasons.TARGETING_MATCH,
                flagMetadata: {},
            })
        })
    })

    describe('Number Flags', () => {
        beforeEach(() => {
            variableMock.mockReturnValue({
                key: 'num-flag',
                value: 610,
                defaultValue: 2056,
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            identifyUserMock.mockResolvedValue({})
        })

        it('should resolve a number flag value', async () => {
            const { ofClient } = await initOFClient()
            expect(ofClient.getNumberValue('num-flag', 2056)).toEqual(610)
        })

        it('should resolve a number flag details', async () => {
            const { ofClient } = await initOFClient()
            expect(ofClient.getNumberDetails('num-flag', 2056)).toEqual({
                flagKey: 'num-flag',
                value: 610,
                reason: StandardResolutionReasons.TARGETING_MATCH,
                flagMetadata: {},
            })
        })
    })

    describe('JSON Flags', () => {
        beforeEach(() => {
            variableMock.mockReturnValue({
                key: 'json-flag',
                value: { hello: 'world' },
                defaultValue: { default: 'value' },
                isDefaulted: false,
                evalReason: undefined,
                onUpdate: jest.fn(),
            })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            identifyUserMock.mockResolvedValue({})
        })

        it('should resolve a string flag value', async () => {
            const { ofClient } = await initOFClient()
            expect(
                ofClient.getObjectValue('json-flag', { default: 'value' }),
            ).toEqual({ hello: 'world' })
        })

        it('should resolve a boolean flag details', async () => {
            const { ofClient } = await initOFClient()
            expect(
                ofClient.getObjectDetails('json-flag', { default: 'value' }),
            ).toEqual({
                flagKey: 'json-flag',
                value: { hello: 'world' },
                reason: StandardResolutionReasons.TARGETING_MATCH,
                flagMetadata: {},
            })
        })

        it('should return default value if json default is not an object', async () => {
            const { ofClient } = await initOFClient()
            expect(ofClient.getObjectDetails('json-flag', ['arry'])).toEqual({
                flagKey: 'json-flag',
                value: ['arry'],
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(ofClient.getObjectDetails('json-flag', 610)).toEqual({
                flagKey: 'json-flag',
                value: 610,
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(ofClient.getObjectDetails('json-flag', 'string')).toEqual({
                flagKey: 'json-flag',
                value: 'string',
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(ofClient.getObjectDetails('json-flag', false)).toEqual({
                flagKey: 'json-flag',
                value: false,
                reason: 'ERROR',
                errorCode: 'PARSE_ERROR',
                errorMessage:
                    'DevCycle only supports object values for JSON flags',
                flagMetadata: {},
            })
            expect(ofClient.getObjectDetails('json-flag', null)).toEqual({
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
})

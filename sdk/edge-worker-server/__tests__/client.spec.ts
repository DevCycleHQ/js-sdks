/* eslint-disable @typescript-eslint/ban-ts-comment */
const testVariable = {
    _id: 'test-id',
    value: true,
    type: 'Boolean',
    key: 'test-key',
    evalReason: null,
    defaultValue: false,
}
const mockGenerateBucketedConfig = jest.fn().mockReturnValue({
    variables: { 'test-key': testVariable },
    features: {
        'test-feature': {
            _id: 'test-id',
            _variation: 'variation-id',
            variationKey: 'variationKey',
            variationName: 'Variation Name',
            key: 'test-feature',
            type: 'release',
        },
    },
    variableVariationMap: {
        'test-key': {
            _feature: 'test-id',
            _variation: 'variation-id',
        },
    },
})
jest.mock('@devcycle/bucketing', () => {
    return {
        generateBucketedConfig: mockGenerateBucketedConfig,
    }
})

const mockFetchConfigPromise = Promise.resolve()
jest.mock('@devcycle/config-manager', () => {
    return {
        EnvironmentConfigManager: jest.fn().mockImplementation(() => {
            return { fetchConfigPromise: mockFetchConfigPromise }
        }),
    }
})

import { DevCycleEdgeClient, initializeDevCycle } from '../src'
import { DevCycleUser } from '@devcycle/js-cloud-server-sdk'

describe('DevCycleEdgeClient Tests', () => {
    const user = {
        user_id: 'node_sdk_test',
        country: 'CA',
        customData: {
            test: 'test',
            canBeNull: null,
        },
        privateCustomData: {
            private: 'private',
        },
    }
    const emptyUser = { user_id: 'empty' }

    let client: DevCycleEdgeClient

    beforeAll(async () => {
        client = initializeDevCycle('server_token', {})
        await client.onClientInitialized()
    })

    beforeEach(async () => {
        jest.clearAllMocks()
    })

    describe('variable', () => {
        it('returns a valid variable object for a variable that is in the config', async () => {
            const variable = await client.variable(user, 'test-key', false)
            expect(variable.value).toEqual(true)
            expect(variable.isDefaulted).toEqual(false)
            expect(variable.type).toEqual('Boolean')

            expect(await client.variableValue(user, 'test-key', false)).toEqual(
                true,
            )
        })

        it('returns a valid variable object for a variable that is in the config with a DVCUser instance', async () => {
            const dvcUser = new DevCycleUser(user)
            const variable = await client.variable(dvcUser, 'test-key', false)
            expect(variable.value).toEqual(true)
            expect(variable.isDefaulted).toEqual(false)
            expect(variable.type).toEqual('Boolean')

            expect(
                await client.variableValue(dvcUser, 'test-key', false),
            ).toEqual(true)
        })

        it('returns a valid variable object for a variable that is not in the config', async () => {
            mockGenerateBucketedConfig.mockReturnValueOnce({})
            const variable = await client.variable(user, 'test-key2', false)
            expect(variable.value).toEqual(false)
            expect(variable.isDefaulted).toEqual(true)
            expect(variable.type).toEqual('Boolean')

            mockGenerateBucketedConfig.mockReturnValueOnce({})
            expect(
                await client.variableValue(user, 'test-key2', false),
            ).toEqual(false)
        })

        it('returns a defaulted variable object for a variable that is in the config but the wrong type', async () => {
            mockGenerateBucketedConfig.mockReturnValueOnce({})
            const variable = await client.variable(user, 'test-key', 'test')
            expect(variable.value).toEqual('test')
            expect(variable.isDefaulted).toEqual(true)
            expect(variable.type).toEqual('String')

            expect(
                await client.variableValue(user, 'test-key', 'test'),
            ).toEqual('test')
        })

        it('returns a variable with the correct type for string', async () => {
            const variable = await client.variable(user, 'test-key', 'test')
            expect(typeof variable.value).toEqual('string')
            expect(variable.type).toBe('String')
            // this will be a type error for non-strings
            variable.value.concat()
            // should allow assignment to different string
            variable.value = 'test2'
            expect(variable.type).toEqual('String')

            expect(
                await client.variableValue(user, 'test-key', 'test'),
            ).toEqual('test')
        })

        it('returns a variable with the correct type for number', async () => {
            const variable = await client.variable(user, 'test-key', 1)
            expect(typeof variable.value).toEqual('number')
            expect(variable.type).toBe('Number')
            // this will be a type error for non-numbers
            variable.value.toFixed()

            expect(await client.variableValue(user, 'test-key', 1)).toEqual(1)
        })

        it('returns a variable with the correct type for JSON', async () => {
            const defaultVal = { key: 'test' }
            const variable = await client.variable(user, 'test-key', defaultVal)
            expect(variable.value).toBeInstanceOf(Object)
            expect(variable.type).toBe('JSON')
            expect(variable.value).toEqual({ key: 'test' })

            expect(
                await client.variableValue(user, 'test-key', { key: 'test' }),
            ).toEqual(defaultVal)
        })

        it('to throw an error if key is not defined', async () => {
            try {
                await client.variable(
                    user,
                    undefined as unknown as string,
                    false,
                )
            } catch (ex) {
                expect(ex.message).toBe('Missing parameter: key')
            }

            try {
                await client.variableValue(
                    user,
                    undefined as unknown as string,
                    false,
                )
            } catch (ex) {
                expect(ex.message).toBe('Missing parameter: key')
            }
        })

        it('to throw an error if defaultValue is not defined', async () => {
            try {
                await client.variable(
                    user,
                    'test-key',
                    undefined as unknown as string,
                )
            } catch (ex) {
                expect(ex.message).toBe(
                    'The default value for variable test-key is not of type Boolean, Number, String, or JSON',
                )
            }

            try {
                await client.variableValue(
                    user,
                    'test-key',
                    undefined as unknown as string,
                )
            } catch (ex) {
                expect(ex.message).toBe(
                    'The default value for variable test-key is not of type Boolean, Number, String, or JSON',
                )
            }
        })
    })

    describe('allVariables', () => {
        it('to return all variables', async () => {
            const res = await client.allVariables(user)
            expect(res).toEqual({
                'test-key': {
                    _id: 'test-id',
                    key: 'test-key',
                    value: true,
                    type: 'Boolean',
                    defaultValue: false,
                    evalReason: null,
                },
            })
        })

        it('to return no variables when allVariables call succeeds but user has no variables', async () => {
            mockGenerateBucketedConfig.mockReturnValueOnce({})
            const res = await client.allVariables(emptyUser)
            expect(res).toEqual({})
        })
    })

    describe('allFeatures', () => {
        it('to return all features', async () => {
            const res = await client.allFeatures(user)
            expect(res).toEqual({
                'test-feature': {
                    _id: 'test-id',
                    _variation: 'variation-id',
                    variationKey: 'variationKey',
                    variationName: 'Variation Name',
                    key: 'test-feature',
                    type: 'release',
                },
            })
        })

        it('to return no features when allFeatures call succeeds but user has no features', async () => {
            mockGenerateBucketedConfig.mockReturnValueOnce({})
            const res = await client.allFeatures(emptyUser)
            expect(res).toEqual({})
        })
    })
})

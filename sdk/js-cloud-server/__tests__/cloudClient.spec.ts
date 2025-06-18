jest.unmock('cross-fetch')
import fetch from 'cross-fetch'

Object.defineProperty(global, 'fetch', { writable: true })
global.fetch = fetch

import { DevCycleEvent } from '../src/types'
import * as DVC from '../src'
import { server } from '../src/__mocks__/server'
import { EvalHook } from '../src/hooks/EvalHook'

let client: DVC.DevCycleCloudClient

const user = {
    user_id: 'node_sdk_test',
    country: 'CA',
}
const badUser = { user_id: 'bad' }
const emptyUser = { user_id: 'empty' }
const respond500User = { user_id: '500' }

jest.mock('fetch-retry')

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('DevCycleCloudClient without EdgeDB', () => {
    beforeAll(async () => {
        client = DVC.initializeDevCycle('dvc_server_token', {
            logLevel: 'error',
        })
    })

    describe('variable', () => {
        it('to return a Value and not be defaulted', async () => {
            const res = await client.variable(user, 'test-key', false)
            expect(res.value).toBe(true)
            expect(res.isDefaulted).toBe(false)
            expect(res.key).not.toContain('edgedb')
            expect(res.type).toEqual('Boolean')
            expect(res.eval).toEqual({
                reason: 'TARGETING_MATCH',
                details: 'User ID',
                target_id: 'test-target-id',
            })

            await expect(
                client.variableValue(user, 'test-key', false),
            ).resolves.toBe(true)
        })

        it('to return default if type doesnt align with the type of defaultValue', async () => {
            const res = await client.variable(user, 'test-key', 'string')
            expect(res.value).toBe('string')
            expect(res.isDefaulted).toBe(true)
            expect(res.key).not.toContain('edgedb')
            expect(res.type).toEqual('String')

            await expect(
                client.variableValue(user, 'test-key', 'string'),
            ).resolves.toBe('string')
        })

        it('to return the Default Value and be defaulted', async () => {
            const res = await client.variable(
                user,
                'test-key-not-in-config',
                false,
            )
            expect(res.value).toBe(false)
            expect(res.isDefaulted).toBe(true)
            expect(res.type).toEqual('Boolean')
            expect(res.eval).toEqual({
                reason: 'DEFAULT',
                details: 'Error',
            })

            await expect(
                client.variableValue(user, 'test-key-not-in-config', false),
            ).resolves.toBe(false)
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
                expect(ex.message).toBe('Missing parameter: defaultValue')
            }

            try {
                await client.variableValue(
                    user,
                    'test-key',
                    undefined as unknown as string,
                )
            } catch (ex) {
                expect(ex.message).toBe('Missing parameter: defaultValue')
            }
        })

        it('returns default when variable request fails', async () => {
            const res = await client.variable(respond500User, 'test-key', false)
            expect(res.value).toBe(false)
            expect(res.isDefaulted).toBe(true)

            await expect(
                client.variableValue(respond500User, 'test-key', false),
            ).resolves.toBe(false)
        })
    })

    describe('allVariables', () => {
        it('to return all variables', async () => {
            const res = await client.allVariables(user)
            expect(res).toEqual({
                'test-key': {
                    key: 'test-key',
                    value: true,
                    type: 'Boolean',
                    defaultValue: false,
                    eval: {
                        reason: 'TARGETING_MATCH',
                        details: 'User ID',
                        target_id: 'test-target-id',
                    },
                },
            })
        })

        it('to return no variables when allVariables call succeeds but user has no variables', async () => {
            const res = await client.allVariables(emptyUser)
            expect(res).toEqual({})
        })

        it('throws exception when allVariables called with invalid user', async () => {
            await expect(async () => {
                await client.allVariables(badUser)
            }).rejects.toThrow('DevCycle request failed with status 400.')
        })

        it('returns empty object when allVariables request fails', async () => {
            const res = await client.allVariables(respond500User)
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
                    eval: {
                        reason: 'TARGETING_MATCH',
                        details: 'User ID',
                        target_id: 'test-target-id',
                    },
                },
            })
        })

        it('to return no features when allFeatures call succeeds but user has no features', async () => {
            const res = await client.allFeatures(emptyUser)
            expect(res).toEqual({})
        })

        it('throws exception when allFeatures called with invalid user', async () => {
            await expect(async () => {
                await client.allFeatures(badUser)
            }).rejects.toThrow('DevCycle request failed with status 400.')
        })

        it('returns empty object when allFeatures request fails', async () => {
            const res = await client.allFeatures(respond500User)
            expect(res).toEqual({})
        })
    })

    describe('track', () => {
        const event = {
            type: 'test-event',
        }
        it('an event successfully', () => {
            expect(async () => await client.track(user, event)).not.toThrow()
        })

        it('throws an error for a null event', () => {
            const badEvent = null
            expect(
                async () =>
                    await client.track(
                        user,
                        badEvent as unknown as DevCycleEvent,
                    ),
            ).rejects.toThrow('Invalid Event')
        })

        it('throws an error for a undefined event', () => {
            const badEvent = undefined
            expect(
                async () =>
                    await client.track(
                        user,
                        badEvent as unknown as DevCycleEvent,
                    ),
            ).rejects.toThrow('Invalid Event')
        })

        it('throws an error for an event with no type', () => {
            const badEvent = { target: 'test' }
            expect(
                async () =>
                    await client.track(
                        user,
                        badEvent as unknown as DevCycleEvent,
                    ),
            ).rejects.toThrow('Invalid Event')
        })

        test.each(['', 7, false, { test: 'test' }, null, undefined])(
            'Invalid Track (Invalid Event Type: %s)',
            async (type) => {
                const badEvent = { type }
                expect(
                    async () =>
                        await client.track(
                            user,
                            badEvent as unknown as DevCycleEvent,
                        ),
                ).rejects.toThrow('Invalid Event')
            },
        )
    })
})

describe('DevCycleCloudClient with EdgeDB Enabled', () => {
    beforeAll(async () => {
        client = DVC.initializeDevCycle('dvc_server_token', {
            logLevel: 'error',
            enableEdgeDB: true,
        })
    })

    describe('variable', () => {
        it('to return a Value and not be defaulted', async () => {
            const res = await client.variable(user, 'test-key', false)
            expect(res.key).toContain('test-key')
            expect(res.value).toBe(true)
            expect(res.isDefaulted).toBe(false)
            expect(res.eval).toEqual({
                reason: 'OPT_IN',
                details: 'Opt-In',
                target_id: 'test-target-id-edgedb',
            })

            await expect(
                client.variableValue(user, 'test-key', false),
            ).resolves.toBe(true)
        })

        it('to return the Default Value and be defaulted', async () => {
            const res = await client.variable(
                user,
                'test-key-not-in-config',
                false,
            )
            expect(res.key).not.toContain('edgedb')
            expect(res.value).toBe(false)
            expect(res.isDefaulted).toBe(true)
            expect(res.eval).toEqual({
                reason: 'DEFAULT',
                details: 'Error',
            })

            await expect(
                client.variableValue(user, 'test-key-not-in-config', false),
            ).resolves.toBe(false)
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
                expect(ex.message).toBe('Missing parameter: defaultValue')
            }

            try {
                await client.variableValue(
                    user,
                    'test-key',
                    undefined as unknown as string,
                )
            } catch (ex) {
                expect(ex.message).toBe('Missing parameter: defaultValue')
            }
        })

        it('returns default when variable request fails', async () => {
            const res = await client.variable(respond500User, 'test-key', false)
            expect(res.value).toBe(false)
            expect(res.isDefaulted).toBe(true)

            await expect(
                client.variableValue(respond500User, 'test-key', false),
            ).resolves.toBe(false)
        })
    })

    describe('allVariables', () => {
        it('to return all variables', async () => {
            const res = await client.allVariables(user)
            expect(res).toEqual({
                'test-key-edgedb': {
                    key: 'test-key-edgedb',
                    value: true,
                    type: 'Boolean',
                    defaultValue: false,
                    eval: {
                        reason: 'OPT_IN',
                        details: 'Opt-In',
                        target_id: 'test-target-id-edgedb',
                    },
                },
            })
        })

        it('to return no variables when allVariables call succeeds but user has no variables', async () => {
            const res = await client.allVariables(emptyUser)
            expect(res).toEqual({})
        })

        it('throws exception when allVariables called with invalid user', async () => {
            await expect(async () => {
                await client.allVariables(badUser)
            }).rejects.toThrow('DevCycle request failed with status 400.')
        })

        it('returns empty object when allVariables request fails', async () => {
            const res = await client.allVariables(respond500User)
            expect(res).toEqual({})
        })
    })

    describe('allFeatures', () => {
        it('to return all features', async () => {
            const res = await client.allFeatures(user)
            expect(res).toEqual({
                'test-feature-edgedb': {
                    _id: 'test-id',
                    _variation: 'variation-id',
                    variationKey: 'variationKey',
                    variationName: 'Variation Name',
                    key: 'test-feature-edgedb',
                    type: 'release',
                    eval: {
                        reason: 'OPT_IN',
                        details: 'Opt-In',
                        target_id: 'test-target-id-edgedb',
                    },
                },
            })
        })

        it('to return no features when allFeatures call succeeds but user has no features', async () => {
            const res = await client.allFeatures(emptyUser)
            expect(res).toEqual({})
        })

        it('throws exception when allFeatures called with invalid user', async () => {
            await expect(async () => {
                await client.allFeatures(badUser)
            }).rejects.toThrow('DevCycle request failed with status 400.')
        })

        it('returns empty object when allFeatures request fails', async () => {
            const res = await client.allFeatures(respond500User)
            expect(res).toEqual({})
        })
    })
})

describe('DevCycleCloudClient with Hooks', () => {
    beforeAll(async () => {
        client = DVC.initializeDevCycle('dvc_server_token', {
            logLevel: 'error',
            enableEdgeDB: true,
        })
    })

    it('should run hooks in correct order', async () => {
        const user = {
            user_id: 'node_sdk_test',
            country: 'CA',
        }
        const before = jest.fn()
        const after = jest.fn()
        const onFinally = jest.fn()
        const error = jest.fn()
        client.addHook(new EvalHook(before, after, onFinally, error))
        const variable = await client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
    })

    it('should return a variable if a before hook errors', async () => {
        const user = {
            user_id: 'node_sdk_test',
            country: 'CA',
        }
        const before = jest.fn(() => {
            throw new Error('test')
        })
        const after = jest.fn()
        const onFinally = jest.fn()
        const error = jest.fn()
        client.addHook(new EvalHook(before, after, onFinally, error))
        const variable = await client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).not.toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
        expect(error).toHaveBeenCalled()
    })

    it('should return a variable if an after hook errors', async () => {
        const user = {
            user_id: 'node_sdk_test',
            country: 'CA',
        }
        const before = jest.fn()
        const after = jest.fn(() => {
            throw new Error('test')
        })
        const onFinally = jest.fn()
        const error = jest.fn()
        client.addHook(new EvalHook(before, after, onFinally, error))
        const variable = await client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
        expect(error).toHaveBeenCalled()
    })

    it('should return a variable if an onFinally hook errors', async () => {
        const user = {
            user_id: 'node_sdk_test',
            country: 'CA',
        }
        const before = jest.fn()
        const after = jest.fn()
        const onFinally = jest.fn(() => {
            throw new Error('test')
        })
        const error = jest.fn()
        client.addHook(new EvalHook(before, after, onFinally, error))
        const variable = await client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
    })

    it('should return a variable if an error hook errors', async () => {
        const user = {
            user_id: 'node_sdk_test',
            country: 'CA',
        }
        const before = jest.fn()
        const after = jest.fn()
        const onFinally = jest.fn()
        const error = jest.fn(() => {
            throw new Error('test')
        })
        client.addHook(new EvalHook(before, after, onFinally, error))
        const variable = await client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
    })
})

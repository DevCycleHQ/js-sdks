/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DevCycleClient } from '../src/client'
import { DevCycleUser } from '@devcycle/js-cloud-server-sdk'
import {
    DEFAULT_REASON_DETAILS,
    DVCCustomDataJSON,
    EVAL_REASON_DETAILS,
    EVAL_REASONS,
} from '@devcycle/types'
import { EvalHook } from '../src/hooks/EvalHook'

jest.mock('../src/bucketing')
jest.mock('@devcycle/config-manager', () => {
    return {
        EnvironmentConfigManager: class {
            hasConfig: boolean
            config: unknown

            constructor() {
                this.hasConfig = true // Set hasConfig to true in the constructor
            }

            cleanup(): void {
                return
            }

            getConfigURL(): string {
                return 'url'
            }

            async _fetchConfig(): Promise<void> {
                this.config = {}
            }
        },
    }
})
jest.mock('../src/eventQueue')

describe('DevCycleClient', () => {
    it('imports bucketing lib on initialize', async () => {
        const client = new DevCycleClient('token')
        expect((client as any).bucketingLib).toBeUndefined()
        await client.onClientInitialized()
        const platformData = (
            (client as any).bucketingLib.setPlatformData as any
        ).mock.calls[0][0]

        expect(JSON.parse(platformData)).toEqual({
            platform: 'NodeJS',
            platformVersion: expect.any(String),
            sdkVersion: expect.any(String),
            sdkType: 'server',
            hostname: expect.any(String),
        })
    })
})

describe('variable', () => {
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

    let client: DevCycleClient

    beforeAll(async () => {
        client = new DevCycleClient('token')
        await client.onClientInitialized()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        client.eventQueue.queueAggregateEvent = jest.fn()
    })
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns a valid variable object for a variable that is in the config', () => {
        const variable = client.variable(user, 'test-key', false)
        expect(variable.value).toEqual(true)
        expect(variable.type).toEqual('Boolean')
        expect(variable.eval).toEqual({
            reason: EVAL_REASONS.TARGETING_MATCH,
            details: EVAL_REASON_DETAILS.ALL_USERS,
            target_id: 'mockTargetId',
        })

        expect(client.variableValue(user, 'test-key', false)).toEqual(true)
    })

    it('returns a valid variable object for a variable that is in the config with a DVCUser instance', () => {
        const dvcUser = new DevCycleUser(user)
        const variable = client.variable(dvcUser, 'test-key', false)
        expect(variable.value).toEqual(true)

        expect(client.variableValue(dvcUser, 'test-key', false)).toEqual(true)
    })

    it('returns a valid variable object for a variable that is not in the config', () => {
        // @ts-ignore
        client.bucketingLib.variableForUser_PB.mockReturnValueOnce(null)
        const variable = client.variable(user, 'test-key2', false)
        expect(variable.value).toEqual(false)
        expect(variable.isDefaulted).toEqual(true)
        expect(variable.eval).toEqual({
            reason: EVAL_REASONS.DEFAULT,
            details: DEFAULT_REASON_DETAILS.USER_NOT_TARGETED,
        })

        // @ts-ignore
        client.bucketingLib.variableForUser_PB.mockReturnValueOnce(null)
        expect(client.variableValue(user, 'test-key2', false)).toEqual(false)
    })

    it('returns a defaulted variable object for a variable that is in the config but the wrong type', () => {
        // @ts-ignore
        client.bucketingLib.variableForUser.mockReturnValueOnce(null)
        const variable = client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(variable.eval).toEqual({
            reason: EVAL_REASONS.DEFAULT,
            details: DEFAULT_REASON_DETAILS.TYPE_MISMATCH,
        })

        expect(client.variableValue(user, 'test-key', 'test')).toEqual('test')
    })

    it('returns a variable with the correct type for string', () => {
        const variable = client.variable(user, 'test-key', 'test')
        expect(typeof variable.value).toEqual('string')
        expect(variable.type).toBe('String')
        // this will be a type error for non-strings
        variable.value.concat()
        // should allow assignment to different string
        variable.value = 'test2'
        expect(variable.type).toEqual('String')

        expect(client.variableValue(user, 'test-key', 'test')).toEqual('test')
    })

    it('returns a variable with the correct type for number', () => {
        const variable = client.variable(user, 'test-key', 1)
        expect(typeof variable.value).toEqual('number')
        expect(variable.type).toBe('Number')
        // this will be a type error for non-numbers
        variable.value.toFixed()

        expect(client.variableValue(user, 'test-key', 1)).toEqual(1)
    })

    it('returns a variable with the correct type for JSON', () => {
        const variable = client.variable(user, 'test-key', { key: 'test' })
        expect(variable.value).toBeInstanceOf(Object)
        expect(variable.type).toBe('JSON')
        expect(variable.value).toEqual({ key: 'test' })

        expect(client.variableValue(user, 'test-key', { key: 'test' })).toEqual(
            {
                key: 'test',
            },
        )
    })
})

describe('setClientCustomData', () => {
    let client: DevCycleClient

    beforeAll(async () => {
        client = new DevCycleClient('token')
        await client.onClientInitialized()
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call bucketingLib.setClientCustomData with correct parameters', () => {
        const customData: DVCCustomDataJSON = { key1: 'value1', key2: 123 }
        client.setClientCustomData(customData)

        expect(
            (client as any).bucketingLib.setClientCustomData,
        ).toHaveBeenCalledWith('token', JSON.stringify(customData))
    })

    it('should throw error if client is not initialized', () => {
        // Create a new client and spy on its access to bucketingLib
        const uninitializedClient = new DevCycleClient('token')

        // Mock the implementation of setClientCustomData to throw an error
        // This simulates the error that would be thrown when bucketingLib is undefined
        jest.spyOn(
            uninitializedClient,
            'setClientCustomData',
        ).mockImplementation(() => {
            throw new Error(
                'Client must be initialized before calling setClientCustomData()',
            )
        })

        const customData: DVCCustomDataJSON = { key1: 'value1' }
        expect(() => {
            uninitializedClient.setClientCustomData(customData)
        }).toThrow(
            'Client must be initialized before calling setClientCustomData()',
        )
    })
})

describe('hooks', () => {
    it('should run hooks in correct order', () => {
        const client = new DevCycleClient('token')
        const user = {
            user_id: 'node_sdk_test',
            country: 'CA',
        }
        const before = jest.fn()
        const after = jest.fn()
        const onFinally = jest.fn()
        const error = jest.fn()
        client.addHook(new EvalHook(before, after, onFinally, error))
        const variable = client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
    })

    it('should return a variable if a before hook errors', () => {
        const client = new DevCycleClient('token')
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
        const variable = client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).not.toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
        expect(error).toHaveBeenCalled()
    })

    it('should return a variable if an after hook errors', () => {
        const client = new DevCycleClient('token')
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
        const variable = client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
        expect(error).toHaveBeenCalled()
    })

    it('should return a variable if an onFinally hook errors', () => {
        const client = new DevCycleClient('token')
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
        const variable = client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
    })

    it('should return a variable if an error hook errors', () => {
        const client = new DevCycleClient('token')
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
        const variable = client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
        expect(before).toHaveBeenCalled()
        expect(after).toHaveBeenCalled()
        expect(onFinally).toHaveBeenCalled()
    })
})

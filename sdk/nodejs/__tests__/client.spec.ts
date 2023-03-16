/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getBucketingLib } from '../src/bucketing'
import { DVCClient } from '../src/client'
import { DVCUser } from '../src/models/user'

jest.mock('../src/bucketing')
jest.mock('../src/environmentConfigManager')
jest.mock('../src/eventQueue')

describe('DVCClient', () => {
    it('imports bucketing lib on initialize', async () => {
        const client = new DVCClient('token')
        expect(() => getBucketingLib()).toThrow()
        await client.onClientInitialized()
        const platformData = (getBucketingLib().setPlatformData as any).mock.calls[0][0]

        expect(JSON.parse(platformData)).toEqual({
            platform: 'NodeJS',
            platformVersion: expect.any(String),
            sdkVersion: expect.any(String),
            sdkType: 'server',
            hostname: expect.any(String)
        })
    })
})

describe('variable', () => {
    const user = {
        user_id: 'node_sdk_test',
        country: 'CA',
        customData: {
            test: 'test',
            publicNull: null,
            publicUndefined: undefined
        },
        privateCustomData: {
            private: 'private',
            privateNull: null,
            privateUndefined: undefined
        }
    }
    const expectedUser = expect.objectContaining({
        user_id: 'node_sdk_test',
        country: 'CA'
    })

    let client: DVCClient

    beforeAll(async () => {
        client = new DVCClient('token')
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
    })

    it('returns a valid variable object for a variable that is in the config with a DVCUser instance', () => {
        const dvcUser = new DVCUser(user)
        const variable = client.variable(dvcUser, 'test-key', false)
        expect(variable.value).toEqual(true)
    })

    it('returns a valid variable object for a variable that is not in the config', () => {
        // @ts-ignore
        getBucketingLib().variableForUser_PB.mockReturnValueOnce(null)
        const variable = client.variable(user, 'test-key2', false)
        expect(variable.value).toEqual(false)
        expect(variable.isDefaulted).toEqual(true)
    })

    it('returns a defaulted variable object for a variable that is in the config but the wrong type', () => {
        // @ts-ignore
        getBucketingLib().variableForUser.mockReturnValueOnce(null)
        const variable = client.variable(user, 'test-key', 'test')
        expect(variable.value).toEqual('test')
        expect(variable.isDefaulted).toEqual(true)
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
    })

    it('returns a variable with the correct type for number', () => {
        const variable = client.variable(user, 'test-key', 1)
        expect(typeof variable.value).toEqual('number')
        expect(variable.type).toBe('Number')
        // this will be a type error for non-numbers
        variable.value.toFixed()
    })

    it('returns a variable with the correct type for JSON', () => {
        const variable = client.variable(user, 'test-key', { key: 'test' })
        expect(variable.value).toBeInstanceOf(Object)
        expect(variable.type).toBe('JSON')
        expect(variable.value).toEqual({ key: 'test' })
    })
})

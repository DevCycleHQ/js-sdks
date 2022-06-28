import { getBucketingLib } from '../src/bucketing'
import { DVCClient } from '../src/client'
jest.mock('../src/bucketing')
jest.mock('../src/environmentConfigManager')

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
            sdkType: 'server'
        })
    })
})

describe('variable', () => {
    const user = {
        user_id: 'node_sdk_test',
        country: 'CA'
    }
    const expectedUser = expect.objectContaining({
        user_id: 'node_sdk_test',
        country: 'CA'
    })
    
    describe('variableDefaulted event', () => {
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
    
        it('does not get sent if variable is in bucketed config',async () => {
            client.variable(user, 'test-key', false)

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(client.eventQueue.queueAggregateEvent)
                .toBeCalledWith(expectedUser, 
                    { type: 'variableEvaluated', target: 'test-key' }, 
                    { 'variables': { ['test-key']: true } }
                )
        })
        it('gets sent if variable is not in bucketed config',async () => {
            client.variable(user, 'test-key-not-in-config', false)

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(client.eventQueue.queueAggregateEvent)
                .toBeCalledWith(expectedUser, 
                    { type: 'variableDefaulted', target: 'test-key-not-in-config' }, 
                    { 'variables': { ['test-key']: true } }
                )
        })
    })
})
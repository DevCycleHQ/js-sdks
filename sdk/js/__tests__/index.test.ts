import { initializeDevCycle } from '../src/index'
jest.mock('../src/Request')
jest.mock('../src/StreamingConnection')
jest.mock('../src/CacheStore')

type VariableTypes = {
    some_key: string
    my_array_json: { test: string[] }
}

describe('initialize', () => {
    it('allows a generic to be passed to initialize', () => {
        const client = initializeDevCycle<VariableTypes>('test', {
            user_id: 'test',
        })
        client.variableValue('my_array_json', { test: [] })
        // @ts-expect-error - should not allow invalid variable keys
        client.variableValue('bad-key', false)
    })
    it('should use second arg as options instead of user in deferred mode', () => {
        const client = initializeDevCycle('test', {
            deferInitialization: true,
        })
        expect(client.user).toBeUndefined()
    })
    it('should use the second arg as user when not in deferred mode', async () => {
        const client = initializeDevCycle('test', {
            user_id: 'test',
        })
        expect(client.user).toBeDefined()
    })
    it('should use the second arg as user when deferred mode is explicitly off', async () => {
        const client = initializeDevCycle(
            'test',
            {
                user_id: 'test',
            },
            {
                deferInitialization: false,
            },
        )
        expect(client.user).toBeDefined()
    })
    it('should not allow no user when deferred mode is explicitly off', async () => {
        expect(() =>
            initializeDevCycle('test', {
                // @ts-expect-error - should not allow no user when deferred mode is explicitly off
                deferInitialization: false,
            }),
        ).toThrow('Missing user! Call initialize with a valid user')
    })
})

global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({ features: {}, variables: {} }),
})

type Variables = {
    enum_var: 'value1' | 'value2'
    bool: boolean
    string: string
    number: number
}
import { DevCycleClient } from '../src/Client'
jest.mock('../src/StreamingConnection')

describe('DevCycleClient', () => {
    it('should prevent invalid variables', () => {
        const client = new DevCycleClient<Variables>('test', {
            user_id: 'test',
        })

        // @ts-expect-error - should not allow invalid variables
        client.variable('something', false)
        client.variable('enum_var', 'value1')
        client.variable('enum_var', 'value2')
        // @ts-expect-error - should not allow invalid variable values for enums
        const enumVar = client.variable('enum_var', 'something_else')

        // @ts-expect-error - should not allow comparison with impossible values
        if (enumVar.value === 'something else') {
            // no-op
        }
        if (enumVar.value === 'value1') {
            // no-op
        }
        client.variable('bool', true)
        client.variable('string', 'test')
        client.variable('number', 1)
    })
    it('should enforce CustomData type checking', () => {
        type MyCustomData = {
            favoriteColor: string
            age: number
        }

        // Correct initialization
        const client = new DevCycleClient<Variables, MyCustomData>('test', {
            user_id: 'test',
            customData: {
                favoriteColor: 'blue',
                age: 30,
            },
        })

        new DevCycleClient<Variables, MyCustomData>('test', {
            user_id: 'test',
            customData: {
                favoriteColor: 'blue',
                // @ts-expect-error - should not allow invalid custom data types
                age: '30', // Should be a number
            },
        })

        new DevCycleClient<Variables, MyCustomData>('test', {
            user_id: 'test',
            // @ts-expect-error - should not allow missing custom data fields
            customData: {
                favoriteColor: 'blue',
                // Missing 'age' field
            },
        })

        // Test identify method
        client.identifyUser({
            user_id: 'newUser',
            customData: {
                favoriteColor: 'red',
                age: 25,
            },
        })

        client.identifyUser({
            user_id: 'newUser',
            customData: {
                favoriteColor: 'red',
                // @ts-expect-error - should not allow invalid custom data in identify
                age: '25', // Should be a number
            },
        })

        client.identifyUser({
            user_id: 'newUser',
            customData: {
                favoriteColor: 'red',
                age: 25,
                // @ts-expect-error - should not allow extra fields in custom data
                extraField: true, // Extra field not in MyCustomData
            },
        })
    })
})

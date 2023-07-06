import { initializeDevCycle } from '../src/index'
jest.mock('../src/Request')
jest.mock('../src/StreamingConnection')

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
})

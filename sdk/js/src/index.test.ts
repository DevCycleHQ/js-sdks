import { initialize } from './index'
jest.mock('./Request')
jest.mock('./StreamingConnection')

type VariableTypes = {
    some_key: string
    my_array_json: { test: string[] }
}

describe('initialize', () => {
    it('allows a generic to be passed to initialize', () => {
        const client = initialize<VariableTypes>('test', { user_id: 'test' })
        client.variableValue('my_array_json', { test: [] })
        // @ts-expect-error - should not allow invalid variable keys
        client.variableValue('bad-key', false)
    })
})

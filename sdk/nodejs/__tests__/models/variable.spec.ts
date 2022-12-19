import { DVCVariable } from '../../src/models/variable'
import { VariableType } from '@devcycle/types'

describe('DVCVariable Unit Tests', () => {

    it('should construct DVCVariable from VariableParam', () => {
        const variable = new DVCVariable({
            key: 'key',
            defaultValue: false,
            value: true,
            type: VariableType.boolean,
            evalReason: 'reason'
        })
        expect(variable).toEqual({
            key: 'key',
            isDefaulted: false,
            value: true,
            defaultValue: false,
            type: 'Boolean',
            evalReason: 'reason'
        })
    })

    it('should check key param is set', () => {
        expect(() => new (DVCVariable as any)({ })).toThrow('Missing parameter: key')
    })

    it('should check defaultValue is set', () => {
        expect(() => new (DVCVariable as any)({ key: 'key' })).toThrow('Missing parameter: defaultValue')
    })

    it('should set isDefaulted properly', () => {
        const variable = new DVCVariable({
            key: 'key',
            defaultValue: false,
            type: VariableType.boolean
        })
        expect(variable).toEqual(expect.objectContaining({
            key: 'key',
            value: false,
            type: 'Boolean',
            defaultValue: false,
            isDefaulted: true
        }))
    })

    it('should lowercase key name', () => {
        const variable = new DVCVariable({
            key: 'camelCaseKey',
            type: VariableType.boolean,
            defaultValue: false
        })
        expect(variable.key).toBe('camelcasekey')
    })
})

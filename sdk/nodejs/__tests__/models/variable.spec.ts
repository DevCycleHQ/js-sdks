import { DVCVariable } from '../../src/models/variable'

describe('DVCVariable Unit Tests', () => {
    it('should construct DVCVariable from VariableParam', () => {
        const variable = new DVCVariable({
            key: 'key',
            defaultValue: false,
            value: true,
            evalReason: 'reason'
        })
        expect(variable).toEqual({
            key: 'key',
            isDefaulted: false,
            value: true,
            defaultValue: false,
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
            defaultValue: false
        })
        expect(variable).toEqual(expect.objectContaining({
            key: 'key',
            value: false,
            defaultValue: false,
            isDefaulted: true
        }))
    })

    it('should lowercase key name', () => {
        const variable = new DVCVariable({
            key: 'camelCaseKey',
            defaultValue: false
        })
        expect(variable.key).toBe('camelcasekey')
    })
})

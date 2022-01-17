import { DVCVariable } from '../Variable'

describe('DVCVariable tests', () => {
    it('should throw error if no key or default value', () => {
        const noKey = () => new DVCVariable({ key: undefined, defaultValue: 'default'})
        const noDefaultValue = () => new DVCVariable({ key: 'key' })
        expect(noKey).toThrow(expect.any(Error))
        expect(noDefaultValue).toThrow(expect.any(Error))
    })

    it('should throw error if key is not a string', () => {
        const keyNotString = () => new DVCVariable({ key: 4, defaultValue: 'default'})
        expect(keyNotString).toThrow(expect.any(Error))
    })

    it('should create a DVCVariable from object', () => {
        const variable = new DVCVariable({ key: 'bruh', defaultValue: false, value: 4, evalReason: {}})
        expect(variable.key).toBe('bruh')
        expect(variable.defaultValue).toBe(false)
        expect(variable.value).toBe(4)
        expect(variable.evalReason).toEqual(expect.any(Object))
    })

    it('should set variable value to false and not default value', () => {
        const variable = new DVCVariable({ key: 'bruh', value: false, defaultValue: 'default' })
        expect(variable.value).toBe(false)
        expect(variable.isDefaulted).toBe(false)
    })

    it('should set variable value to default if no value', () => {
        const variable = new DVCVariable({ key: 'bruh', defaultValue: 'default' })
        expect(variable.value).toBe('default')
        expect(variable.isDefaulted).toBe(true)
    })
})

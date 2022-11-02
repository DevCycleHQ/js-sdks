import { DVCVariable } from '../src/Variable'

describe('DVCVariable tests', () => {
    it('should throw error if no key or default value', () => {
        const noKey = () => new DVCVariable({ key: undefined, defaultValue: 'default' } as any)
        const noDefaultValue = () => new DVCVariable({ key: 'key' } as any)
        expect(noKey).toThrow(expect.any(Error))
        expect(noDefaultValue).toThrow(expect.any(Error))
    })

    it('should throw error if key is not a string', () => {
        const keyNotString = () => new DVCVariable({ key: 4 as any, defaultValue: 'default' })
        expect(keyNotString).toThrow(expect.any(Error))
    })

    it('should create a DVCVariable from object', () => {
        const variable = new DVCVariable({ key: 'variableKey', defaultValue: false, value: 4, evalReason: {} } as any)
        expect(variable.key).toBe('variablekey')
        expect(variable.defaultValue).toBe(false)
        expect(variable.value).toBe(4)
        expect(variable.evalReason).toEqual(expect.any(Object))
    })

    it('should set variable value to false and not default value', () => {
        const variable = new DVCVariable({ key: 'variablekey', value: false, defaultValue: 'default' } as any)
        expect(variable.value).toBe(false)
        expect(variable.isDefaulted).toBe(false)
    })

    it('should set variable value to default if no value', () => {
        const variable = new DVCVariable({ key: 'variablekey', defaultValue: 'default' })
        expect(variable.value).toBe('default')
        expect(variable.isDefaulted).toBe(true)
    })

    it('should provide the correct type for a string variable', () => {
        const variable = new DVCVariable({ key: 'variablekey', defaultValue: 'default' })
        // this will be a type error if not string
        variable.value.concat()
        // allows assignment to other values (i.e. the type is a string and not the literal value default
        variable.value = 'something else'
    })

    it('should provide the correct type for a number variable', () => {
        const variable = new DVCVariable({ key: 'variablekey', defaultValue: 2 })
        // this will be a type error if not number
        variable.value.toFixed()
    })

    it('should provide the correct type for a JSON variable', () => {
        const variable = new DVCVariable({ key: 'variablekey', defaultValue: { test: true } })
        // this will be a type error if it does not allow arbitrary property access
        console.log(variable.value.asdasdas)
    })
})

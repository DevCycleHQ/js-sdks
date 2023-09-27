import {
    checkParamDefined,
    checkParamType,
    typeEnum,
} from '../../../../lib/shared/server-request/src/utils/paramUtils'

describe('paramUtils Unit Tests', () => {
    describe('checkParamDefined', () => {
        it('should checkParamDefined is defined', () => {
            checkParamDefined('param', false)
        })

        it('should throw if param is not defined', () => {
            expect(() => checkParamDefined('param', null)).toThrow(
                'Missing parameter: param',
            )
            expect(() => (checkParamDefined as any)('param')).toThrow(
                'Missing parameter: param',
            )
        })
    })

    describe('checkParamType', () => {
        it('should check that checkParamType is correct type', () => {
            checkParamType('param', 'value', typeEnum.string)
            checkParamType('param', 610, typeEnum.number)
            checkParamType('param', false, typeEnum.boolean)
        })

        it('should throw for undefined param', () => {
            expect(() =>
                checkParamType('param', null, typeEnum.string),
            ).toThrow('param is invalid!')
        })

        it('should throw if param type is not correct', () => {
            expect(() => checkParamType('param', 6, typeEnum.string)).toThrow(
                'param is not of type: string',
            )
            expect(() =>
                checkParamType('param', 'string', typeEnum.number),
            ).toThrow('param is not of type: number')
            expect(() =>
                checkParamType('param', 'string', typeEnum.boolean),
            ).toThrow('param is not of type: boolean')
        })

        it('should throw for invalid type enum value', () => {
            expect(() => (checkParamType as any)('param', 6, 'nonum')).toThrow(
                'unknown type to check: nonum',
            )
        })

        it('should throw for empty string', () => {
            expect(() => checkParamType('param', '', typeEnum.string)).toThrow(
                'param is invalid string!',
            )
        })

        it('should throw for NaN', () => {
            expect(() => checkParamType('param', NaN, typeEnum.number)).toThrow(
                'param is invalid number!',
            )
        })
    })
})

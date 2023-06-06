import { validate } from '../src/types/validators/dvcCustomDataJSON'

describe('IsDVCCustomDataJSONObject validator', () => {
    it('should not validate if input is not an object', () => {
        expect(validate('{}')).toEqual(false)
        expect(validate(null)).toEqual(false)
        expect(validate([{}])).toEqual(false)
    })

    it('should validate if input is a valid json object', () => {
        expect(validate({ string: 'string', bool: false, num: 610 })).toEqual(
            true,
        )
    })

    it('should validate if input is a valid json object with null value', () => {
        expect(
            validate({ string: 'string', bool: false, num: 610, test: null }),
        ).toEqual(true)
    })

    it('should not validate if json object has array values', () => {
        expect(
            validate({
                string: 'string',
                bool: true,
                num: 610,
                arry: [6, 1, 0],
            }),
        ).toEqual(false)
    })
})

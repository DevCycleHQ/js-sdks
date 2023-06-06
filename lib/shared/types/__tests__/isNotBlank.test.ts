import { validate } from '../src/types/validators/isNotBlank'

describe('IsNotBlank validator', () => {
  it('should not validate if input is not a string', () => {
    expect(validate(null)).toEqual(false)
    expect(validate([{}])).toEqual(false)
    expect(validate(12)).toEqual(false)
  })

  it('should validate if input is a valid user id', () => {
    expect(validate('user-id')).toEqual(true)
  })

  it('should not validate if user id is empty spaces', () => {
    expect(validate('')).toEqual(false)
    expect(validate('    ')).toEqual(false)
  })
})

import { isISO6391 } from '../src/types/validators/isIso6391'

describe('IsISO6391 validator', () => {
  it('should not validate if input is not two letters', () => {
    expect(isISO6391('ENG')).toEqual(false)
    expect(isISO6391(null)).toEqual(false)
    expect(isISO6391('*')).toEqual(false)
    expect(isISO6391('E')).toEqual(false)
  })

  it('should not validate if input is invalid two letters', () => {
    expect(isISO6391('xx')).toEqual(false)
    expect(isISO6391('XX')).toEqual(false)
  })

  it('should validate if input is a valid two-letter language code', () => {
    expect(isISO6391('en')).toEqual(true)
    expect(isISO6391('EN')).toEqual(true)
  })
})

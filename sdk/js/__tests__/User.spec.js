import { DVCPopulatedUser } from '../src/User'
import { validate as uuidValidate } from 'uuid'

describe('DVCPopulatedUser tests', () => {
  const setUserAgent = (userAgent) => {
    window.navigator.userAgent = userAgent
  }

  beforeEach(() => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
    )
  })

  it('should make a new user from an object', () => {
    const userObj = {
      isAnonymous: false,
      user_id: '24601',
      email: 'javert@email.com',
      name: 'jason',
      language: 'EN-CA',
      country: 'Canada',
      appVersion: '3.6.1',
      appBuild: 1911,
      customData: {},
      privateCustomData: {},
    }
    const user = new DVCPopulatedUser(userObj)
    const validate = (key) => {
      expect(userObj[key]).toEqual(user[key])
    }
    Object.keys(userObj).forEach((key) => {
      validate(key)
    })
    expect(user.createdDate).toStrictEqual(expect.any(Date))
    expect(user.lastSeenDate).toStrictEqual(expect.any(Date))
    expect(user.platform).toBe('web')
    expect(user.deviceModel).toStrictEqual(expect.any(String))
    expect(user.sdkType).toBe('client')
    expect(user.sdkVersion).toStrictEqual(expect.any(String))
  })

  it('should set user agent version from user agent string as platform version', () => {
    const user = new DVCPopulatedUser({ user_id: 'user1' })
    expect(user.platformVersion).toBe('Chrome 99.0.4844.51')
  })

  it('should set user agent as unknown if user agent undefined', () => {
    setUserAgent(undefined)
    const user = new DVCPopulatedUser({ user_id: 'user1' })
    expect(user.platformVersion).toBe('unknown')
  })

  it('should make a new user if user id provided but no isAnonymous flag', () => {
    const user = new DVCPopulatedUser({ user_id: 'user1' })
    expect(user.user_id).toBe('user1')
    expect(user.isAnonymous).toBe(false)
  })

  it('should NOT throw an error if no user id and no anonymous flag set', () => {
    const createUser = () => {
      new DVCPopulatedUser({})
    }
    expect(createUser).not.toThrow(expect.any(Error))
  })

  it('should create an anonymous user id if isAnonymous is true', () => {
    const newUser = new DVCPopulatedUser({ isAnonymous: true })
    expect(uuidValidate(newUser.user_id)).toBe(true)
  })

  it('should throw an error if the user id is an empty string', () => {
    const createUser = () => {
      new DVCPopulatedUser({ user_id: '' })
    }
    expect(createUser).toThrow(expect.any(Error))
  })

  it('should throw an error if the user id is a string of only whitespace', () => {
    const createUser = () => {
      new DVCPopulatedUser({ user_id: '     ' })
    }
    expect(createUser).toThrow(expect.any(Error))
  })
})

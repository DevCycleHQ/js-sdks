import { DVCPopulatedUser } from '../src/User'
import { validate as uuidValidate } from 'uuid'

describe('DVCPopulatedUser tests', () => {
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
            privateCustomData: {}
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

    it('should make a new user if user id provided but no isAnonymous flag', () => {
        const user = new DVCPopulatedUser({ user_id: 'user1' })
        expect(user.user_id).toBe('user1')
        expect(user.isAnonymous).toBe(false)
    })

    it('should throw an error if no user id and no anonymous flag set', () => {
        const createUser = () => {
            new DVCPopulatedUser({})
        }
        expect(createUser).toThrow(expect.any(Error))
    })

    it('should create an anonymous user id if isAnonymous is true', () => {
        const newUser = new DVCPopulatedUser({ isAnonymous: true })
        expect(uuidValidate(newUser.user_id)).toBe(true)
    })
})

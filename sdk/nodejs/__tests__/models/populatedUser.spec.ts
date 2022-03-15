import { DVCPopulatedUser } from '../../src/models/populatedUser'

describe('DVCPopulatedUser Unit Tests', () => {
    it('should construct DVCPopulatedUser from UserParam', () => {
        const requestUser = new DVCPopulatedUser({
            user_id: 'user_id',
            email: 'email',
            name: 'name',
            language: 'en',
            country: 'ca',
            appVersion: 'appVersion',
            appBuild: 1,
            customData: { custom: 'data' },
            privateCustomData: { private: 'customData' }
        })
        expect(requestUser).toEqual(expect.objectContaining({
            user_id: 'user_id',
            email: 'email',
            name: 'name',
            language: 'en',
            country: 'ca',
            appVersion: 'appVersion',
            appBuild: 1,
            customData: { custom: 'data' },
            privateCustomData: { private: 'customData' },
            lastSeenDate: expect.any(Date),
            createdDate: expect.any(Date),
            platform: 'NodeJS',
            platformVersion: expect.any(String),
            sdkType: 'server',
            sdkVersion: expect.any(String)
        }))
    })

    it('should throw error if user_id is missing', () => {
        expect(() => new (DVCPopulatedUser as any)({})).toThrow('Must have a user_id set on the user')
        expect(() => new (DVCPopulatedUser as any)({ user_id: '' })).toThrow('Must have a user_id set on the user')
        expect(() => new (DVCPopulatedUser as any)({ user_id: 8 })).toThrow('user_id is not of type: string')
    })
})

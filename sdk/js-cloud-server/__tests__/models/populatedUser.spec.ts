import { DVCPopulatedUser } from '../../src/models/populatedUser'
import { DevCycleUser } from '../../src/models/user'

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
            privateCustomData: { private: 'customData' },
        })
        expect(requestUser).toEqual(
            expect.objectContaining({
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
                sdkVersion: expect.any(String),
            }),
        )
    })

    it('should construct DVCPopulatedUser from DVCUser', () => {
        const requestUser = new DevCycleUser({
            user_id: 'user_id',
            email: 'email',
            name: 'name',
            language: 'en',
            country: 'ca',
            appVersion: 'appVersion',
            appBuild: 1,
            customData: { custom: 'data' },
            privateCustomData: { private: 'customData' },
        })
        const populatedUser = DVCPopulatedUser.fromDVCUser(requestUser)
        expect(populatedUser).toEqual(
            expect.objectContaining({
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
                sdkVersion: expect.any(String),
            }),
        )
    })
})

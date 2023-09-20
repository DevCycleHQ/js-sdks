import { DVCPopulatedPBUser } from '../../src/models/populatedPBUser'
import { DevCycleUser } from '@devcycle/js-cloud-server-sdk'

describe('DVCPopulatedPBUser Unit Tests', () => {
    it('should construct DVCPopulatedPBUser from UserParam', () => {
        const requestUser = new DVCPopulatedPBUser({
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

    it('should construct DVCPopulatedPBUser from DVCUser', () => {
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
        const populatedUser = DVCPopulatedPBUser.fromDVCUser(requestUser)
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

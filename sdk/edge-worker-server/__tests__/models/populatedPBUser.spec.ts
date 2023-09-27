import { DVCPopulatedUserFromDevCycleUser } from '../../src/models/populatedUserHelpers'
import { DevCycleUser } from '@devcycle/js-cloud-server-sdk'

describe('DVCPopulatedPBUser Unit Tests', () => {
    it('should construct DVCPopulatedPBUser from UserParam', () => {
        const requestUser = DVCPopulatedUserFromDevCycleUser(
            new DevCycleUser({
                user_id: 'user_id',
                email: 'email',
                name: 'name',
                language: 'en',
                country: 'ca',
                appVersion: 'appVersion',
                appBuild: 1,
                customData: { custom: 'data' },
                privateCustomData: { private: 'customData' },
            }),
            {
                platformVersion: 'platformVersion',
                hostname: 'hostname',
            },
        )
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
                platform: 'EdgeWorker',
                platformVersion: 'platformVersion',
                sdkType: 'server',
                sdkVersion: expect.any(String),
                hostname: 'hostname',
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
        const populatedUser = DVCPopulatedUserFromDevCycleUser(requestUser, {})
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
                platform: 'EdgeWorker',
                platformVersion: '',
                sdkType: 'server',
                sdkVersion: expect.any(String),
                hostname: '',
            }),
        )
    })
})

import { plainToInstance } from 'class-transformer'
import { DVCAPIUser } from '../src/types/apis/sdk/clientSDKAPI'
import { validate } from 'class-validator'

const date = new Date()
const testUserData = {
    isAnonymous: 'false',
    isDebug: 'false',
    user_id: 'user_id',
    email: 'email@devcycle.com',
    name: 'name',
    language: 'en',
    country: 'CA',
    appVersion: '1.0.0',
    appBuild: '100',
    customData: '{"custom":"data"}',
    privateCustomData: '{}',
    createdDate: date,
    lastSeenDate: date,
    platform: 'platform',
    platformVersion: '10.0',
    deviceModel: 'web device',
    sdkType: 'client',
    sdkVersion: '1.0.0',
}

describe('clientSDKAPI types', () => {
    describe('date transformation', () => {
        it('should accept dates as date objects', async () => {
            const userObj = plainToInstance(DVCAPIUser, testUserData)
            expect(await validate(userObj)).toHaveLength(0)
        })

        it('should accept dates as date-time strings', async () => {
            const userObj = plainToInstance(DVCAPIUser, {
                ...testUserData,
                createdDate: date.toLocaleDateString(),
                lastSeenDate: date.toLocaleDateString(),
            })
            expect(await validate(userObj)).toHaveLength(0)
        })

        it('should accept dates as numbers', async () => {
            const userObj = plainToInstance(DVCAPIUser, {
                ...testUserData,
                createdDate: date.getTime(),
                lastSeenDate: date.getTime(),
            })
            expect(await validate(userObj)).toHaveLength(0)
        })

        it('should accept dates as number strings', async () => {
            const userObj = plainToInstance(DVCAPIUser, {
                ...testUserData,
                createdDate: `${date.getTime()}`,
                lastSeenDate: `${date.getTime()}`,
            })
            expect(await validate(userObj)).toHaveLength(0)
        })
    })
})

import { testDVCUserClass } from '../../build/bucketing-lib.debug'
import { setPlatformDataJSON } from '../setPlatformData'

setPlatformDataJSON()

function testDVCUser(userObj: unknown): unknown {
    return JSON.parse(testDVCUserClass(JSON.stringify(userObj)))
}

describe('dvcUser Tests', () => {
    it('should test DVCUser class JSON parsing', () => {
        const userObj = {
            user_id: '24601',
            email: 'javert@email.com',
            name: 'jason',
            language: 'EN-CA',
            country: 'Canada',
            appVersion: '3.6.1',
            appBuild: 1911,
            customData: {
                'string': 'val',
                'num': 610,
                'bool': true
            },
            privateCustomData: {
                'key': 'val'
            }
        }

        expect(testDVCUser(userObj)).toEqual(expect.objectContaining({
            ...userObj,
            deviceModel: '',
            platform: 'NodeJS',
            platformVersion: '',
            sdkType: 'server',
            sdkVersion: '1.0.0',
            createdDate: expect.any(String),
            lastSeenDate: expect.any(String)
        }))
    })

    it('should throw error if customData is not a flat JSON Obj', () => {
        const userObj = {
            user_id: '24601',
            customData: {
                'string': 'val',
                'num': [610, 2809],
            }
        }

        expect(() => testDVCUser(userObj))
            .toThrow('DVCUser customData can\'t contain nested objects or arrays')
    })

    it('should throw error if privateCustomData is not a flat JSON Obj', () => {
        const userObj = {
            user_id: '24601',
            privateCustomData: {
                'key': 'val',
                'values': {
                    'obj': true
                }
            }
        }

        expect(() => testDVCUser(userObj))
            .toThrow('DVCUser privateCustomData can\'t contain nested objects or arrays')
    })

    it('should support user_id as email', () => {
        const userObj = {
            user_id: 'test@devcycle.com'
        }

        expect(testDVCUser(userObj)).toEqual(expect.objectContaining({
            ...userObj,
            deviceModel: '',
            platform: 'NodeJS',
            platformVersion: '',
            sdkType: 'server',
            sdkVersion: '1.0.0',
            createdDate: expect.any(String),
            lastSeenDate: expect.any(String)
        }))
    })
})

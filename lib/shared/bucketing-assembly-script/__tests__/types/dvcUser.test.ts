import { testDVCUserClass, testDVCUserClassFromUTF8 } from '../bucketingImportHelper'
import { setPlatformDataJSON } from '../setPlatformData'

setPlatformDataJSON()

function testDVCUser(obj: any, utf8: boolean): any {
    const str = JSON.stringify(obj)
    if (utf8) {
        const buff = Buffer.from(str, 'utf8')
        return JSON.parse(testDVCUserClassFromUTF8(buff))
    } else {
        return JSON.parse(testDVCUserClass(str))
    }
}

describe.each([true, false])('dvcUser Tests', (utf8) => {
    it('should test DVCUser class JSON parsing', () => {
        const userObj = {
            user_id: '24601',
            email: 'javert@email.com',
            name: 'jason',
            language: 'EN-CA',
            country: 'Canada',
            appVersion: '3.6.1',
            appBuild: 1911,
            deviceModel: 'iPhone',
            customData: {
                'string': 'val',
                'num': 610,
                'bool': true
            },
            privateCustomData: {
                'key': 'val'
            }
        }

        expect(testDVCUser(userObj, utf8)).toEqual(expect.objectContaining({
            ...userObj,
            deviceModel: 'iPhone',
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
                string: 'val',
                num: [610, 2809]
            }
        }

        expect(() => testDVCUser(userObj, utf8))
            .toThrow('DVCUser customData can\'t contain nested objects or arrays')
    })

    it('should throw error if privateCustomData is not a flat JSON Obj', () => {
        const userObj = {
            user_id: '24601',
            privateCustomData: {
                key: 'val',
                values: { obj: true }
            }
        }

        expect(() => testDVCUser(userObj, utf8))
            .toThrow('DVCUser privateCustomData can\'t contain nested objects or arrays')
    })

    it('should support user_id as email, and only require user_id to be set', () => {
        const userObj = {
            user_id: 'test@devcycle.com'
        }

        expect(testDVCUser(userObj, utf8)).toEqual(expect.objectContaining({
            ...userObj,
            platform: 'NodeJS',
            platformVersion: '',
            sdkType: 'server',
            sdkVersion: '1.0.0',
            createdDate: expect.any(String),
            lastSeenDate: expect.any(String)
        }))
    })

    it('should throw if appBuild is not a number', () => {
        const userObj = {
            user_id: 'test',
            appBuild: 'not a number'
        }

        expect(() => testDVCUser(userObj, utf8))
            .toThrow('Invalid number value: not a number, for key: "appBuild"')
    })

    it('should throw is string key is not a string', () => {
        const userObj = { user_id: true }

        expect(() => testDVCUser(userObj, utf8))
            .toThrow('Missing string value for key: "user_id",')
    })
})

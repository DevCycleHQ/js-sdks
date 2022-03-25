import { testConfigBodyClass, testDVCUserClass } from '../build/bucketing-lib.debug'
import testData from '../../bucketing-test-data/json-data/testData.json'

describe('WASM test', () => {
    it('should test ConfigBody class JSON parsing', () => {
        const configStr = JSON.stringify(testData.config)
        console.log('configStr: ' + configStr)
        const result = testConfigBodyClass(configStr)
        console.log('ConfigBody result: ' + result)

        const resultJSON = JSON.parse(result)
        const configJSON = JSON.parse(JSON.stringify(testData.config))
        expect(resultJSON).toEqual(configJSON)
    })

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
                "string": "val",
                "num": 610,
                "bool": true
            },
            privateCustomData: {
                "key": "val"
            }
        }

        const result = testDVCUserClass(JSON.stringify(userObj))
        const resultJSON = JSON.parse(result)
        console.log('DVCUser result: ' + result)

        expect(resultJSON).toEqual(expect.objectContaining({
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

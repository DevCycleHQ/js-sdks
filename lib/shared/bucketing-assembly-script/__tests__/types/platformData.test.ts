import { testPlatformDataClass, testPlatformDataClassFromUTF8 } from '../bucketingImportHelper'

const testPlatformData = (str: string, utf8: boolean): any => {
    if (utf8) {
        const buff = Buffer.from(str, 'utf8')
        return JSON.parse(testPlatformDataClassFromUTF8(buff))
    } else {
        return JSON.parse(testPlatformDataClass(str))
    }
}

describe.each([true, false])('PlatformData Model Tests', (utf8) => {
    it('should test PlatformData JSON parsing', () => {
        const platformData = {
            platform: 'platform',
            platformVersion: '1.0.0',
            sdkType: 'server',
            sdkVersion: '3.3.3',
            hostname: 'host.name',
            clientUUID: 'client.UUID'
        }
        expect(testPlatformData(JSON.stringify(platformData), utf8)).toEqual(platformData)
    })

    it('should test PlatformData non-optional JSON parsing', () => {
        const platformData = {
            platform: 'platform',
            platformVersion: '1.0.0',
            sdkType: 'server',
            sdkVersion: '3.3.3'
        }
        expect(testPlatformData(JSON.stringify(platformData), utf8)).toEqual(platformData)
    })
})

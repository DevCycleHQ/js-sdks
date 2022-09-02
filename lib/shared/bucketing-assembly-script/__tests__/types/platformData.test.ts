import { testPlatformDataClass } from '../../build/bucketing-lib.debug'

const testPlatformData = (data: unknown): unknown => {
    return JSON.parse(testPlatformDataClass(JSON.stringify(data)))
}

describe('PlatformData Model Tests', () => {
    it('should test PlatformData JSON parsing', () => {
        const platformData = {
            platform: 'platform',
            platformVersion: '1.0.0',
            sdkType: 'server',
            sdkVersion: '3.3.3',
            hostname: 'host.name'
        }
        expect(testPlatformData(platformData)).toEqual(platformData)
    })

    it('should test PlatformData non-optional JSON parsing', () => {
        const platformData = {
            platform: 'platform',
            platformVersion: '1.0.0',
            sdkType: 'server',
            sdkVersion: '3.3.3'
        }
        expect(testPlatformData(platformData)).toEqual(platformData)
    })
})

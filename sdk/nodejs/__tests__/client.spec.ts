import { getBucketingLib } from '../src/bucketing'
import { DVCClient } from '../src/client'
jest.mock('../src/bucketing')
jest.mock('../src/environmentConfigManager')

describe('DVCClient', () => {
    it('imports bucketing lib on initialize', async () => {
        const client = new DVCClient('token')
        expect(() => getBucketingLib()).toThrow()
        await client.onClientInitialized()
        const platformData = (getBucketingLib().setPlatformData as any).mock.calls[0][0]

        expect(JSON.parse(platformData)).toEqual({
            platform: 'NodeJS',
            platformVersion: expect.any(String),
            sdkVersion: expect.any(String),
            sdkType: 'server'
        })
    })
})

import { DVCClient, DVCCloudClient, initialize } from '../src/index'

jest.mock('../src/bucketing')
jest.mock('../src/environmentConfigManager')

describe('NodeJS SDK Initialize', () => {
    afterAll(() => {
        jest.clearAllMocks()
    })

    it('sucessfully calls initialize with no options', async () => {
        const client: DVCClient = await initialize('token').onClientInitialized()
        expect(client).toBeDefined()
    })

    it('fails to initialize in Local Bucketing mode when no token is provided', () => {
        expect(() => 
            initialize(undefined as unknown as string)
        ).toThrow('Missing environment key! Call initialize with a valid environment key')
    })

    it('sucessfully calls initialize with enableCloudBucketing set to true', () => {
        const client: DVCCloudClient = initialize('token', { enableCloudBucketing: true })
        expect(client).toBeDefined()
    })

    it('fails to initialize in Cloud Bucketing mode when no token is provided', () => {
        expect(() =>
            initialize(undefined as unknown as string, { enableCloudBucketing: true })
        ).toThrow('Missing environment key! Call initialize with a valid environment key')
    })
})

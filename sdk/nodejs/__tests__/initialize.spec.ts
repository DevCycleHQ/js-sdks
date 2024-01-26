import { DevCycleCloudClient, initializeDevCycle } from '../src/index'
import { OpenFeature } from '@openfeature/server-sdk'

jest.mock('../src/bucketing')
jest.mock('@devcycle/config-manager')

describe('NodeJS SDK Initialize', () => {
    afterAll(() => {
        jest.clearAllMocks()
    })

    it('successfully calls initialize with no options', async () => {
        const client = await initializeDevCycle(
            'dvc_server_token',
        ).onClientInitialized()
        expect(client).toBeDefined()
    })

    it('successfully creates a OpenFeature provider', async () => {
        const provider =
            initializeDevCycle('dvc_server_token').getOpenFeatureProvider()
        expect(provider).toBeDefined()
        expect(provider.status).toBe('NOT READY')
        await OpenFeature.setProviderAndWait(provider)
        expect(provider.status).toBe('READY')
        const client = OpenFeature.getClient()
        expect(client).toBeDefined()
    })

    it('fails to initialize in Local Bucketing mode when no token is provided', () => {
        expect(() =>
            initializeDevCycle(undefined as unknown as string),
        ).toThrow('Missing SDK key! Call initialize with a valid SDK key')
    })

    it('fails to initialize in Local Bucketing mode when client token is provided', () => {
        expect(() => initializeDevCycle('dvc_client_token')).toThrow(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    })

    it('sucessfully calls initialize with enableCloudBucketing set to true', () => {
        const client: DevCycleCloudClient = initializeDevCycle(
            'dvc_server_token',
            {
                enableCloudBucketing: true,
            },
        )
        expect(client).toBeDefined()
    })

    it('fails to initialize in Cloud Bucketing mode when no token is provided', () => {
        expect(() =>
            initializeDevCycle(undefined as unknown as string, {
                enableCloudBucketing: true,
            }),
        ).toThrow('Missing SDK key! Call initialize with a valid SDK key')
    })
})

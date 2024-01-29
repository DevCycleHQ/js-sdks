import { initializeDevCycle } from '../src/index'
import { OpenFeature } from '@openfeature/server-sdk'

describe('JS Cloud Bucketing Server SDK Initialize', () => {
    afterAll(() => {
        jest.clearAllMocks()
    })

    it('successfully calls initialize with no options', async () => {
        const client = initializeDevCycle('dvc_server_token')
        expect(client).toBeDefined()
    })

    it('successfully creates a OpenFeature provider', async () => {
        const provider =
            initializeDevCycle('dvc_server_token').getOpenFeatureProvider()
        expect(provider).toBeDefined()
        expect(provider.status).toBe('READY') // isInitialized() always returns true
        await OpenFeature.setProviderAndWait(provider)
        expect(provider.status).toBe('READY')
        const client = OpenFeature.getClient()
        expect(client).toBeDefined()
    })

    it('fails to initialize when no token is provided', () => {
        expect(() =>
            initializeDevCycle(undefined as unknown as string),
        ).toThrow('Missing SDK key! Call initialize with a valid SDK key')
    })

    it('fails to initialize when client token is provided', () => {
        expect(() => initializeDevCycle('dvc_client_token')).toThrow(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    })
})

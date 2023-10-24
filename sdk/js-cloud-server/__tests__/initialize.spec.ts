import { initializeDevCycle } from '../src/index'

describe('JS Cloud Bucketing Server SDK Initialize', () => {
    afterAll(() => {
        jest.clearAllMocks()
    })

    it('successfully calls initialize with no options', async () => {
        const client = initializeDevCycle('dvc_server_token')
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

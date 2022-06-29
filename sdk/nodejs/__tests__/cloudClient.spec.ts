import * as DVC from '../src'

let client: DVC.DVCCloudClient

jest.mock("axios")

const user = {
    user_id: 'node_sdk_test',
    country: 'CA'
}
const badUser = { user_id: 'bad' }
const emptyUser = { user_id: 'empty' }

describe('DVCCloudClient', () => {
    beforeAll(async () => {
        client = DVC.initialize('token', { logLevel: 'error', enabledCloudBucketing: true }) as DVC.DVCCloudClient
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('variable', () => {
        it('to return a Value and not be defaulted', async () => {
            const res = await client.variable(user, 'test-key', false)
            expect(res.value).toBe(true)
            expect(res.isDefaulted).toBe(false)
        })

        it('to return the Default Value and be defaulted', async () => {
            const res = await client.variable(user, 'test-key-not-in-config', false)
            expect(res.value).toBe(false)
            expect(res.isDefaulted).toBe(true)
        })
    })

    describe('allVariables', () => {
        it('to return all variables', async () => {
            const res = await client.allVariables(user)
            expect(res).toEqual({
                'test-key': {
                    key: 'test-key',
                    value: true,
                    type: 'Boolean',
                    defaultValue: false
                }
            })
        })

        it('to return no variables when allVariables call succeeds but user has no variables', async () => {
            const res = await client.allVariables(emptyUser)
            expect(res).toEqual({})
        })

        it('to return no variables when allVariables call fails', async () => {
            const res = await client.allVariables(badUser)
            expect(res).toEqual({})
        })
    })

    describe('allFeatures', () => {
        it('to return all features', async () => {
            const res = await client.allFeatures(user)
            expect(res).toEqual({
                'test-feature': {
                    _id: 'test-id',
                    _variation: 'variation-id',
                    variationKey: 'variationKey',
                    variationName: 'Variation Name',
                    key: 'test-feature',
                    type: 'release',
                }
            })
        })

        it('to return no features when allFeatures call succeeds but user has no features', async () => {
            const res = await client.allFeatures(emptyUser)
            expect(res).toEqual({})
        })

        it('to return no features when allFeatures call fails', async () => {
            const res = await client.allFeatures(badUser)
            expect(res).toEqual({})
        })
    })

    describe('track', () => {
        const event = {
            type: 'test-event',
        }
        it('an event successfully', async () => {
            try {
                client.track(user, event)
            } catch (ex) {
                expect(ex).not.toHaveBeenCalled()
            }
        })

        it('fails', async () => {
            try {
                client.track(badUser, event)
            } catch (ex) {
                expect(ex.message).toBe(
                    'DVC Error Tracking Event. Response message: Unauthorized'
                )
            }
        })
    })
})
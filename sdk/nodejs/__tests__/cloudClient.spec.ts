import { DVCEvent } from '../src/types'
import * as DVC from '../src'
import { server } from '../src/__mocks__/server'

let client: DVC.DVCCloudClient

const user = {
    user_id: 'node_sdk_test',
    country: 'CA'
}
const badUser = { user_id: 'bad' }
const emptyUser = { user_id: 'empty' }

describe('DVCCloudClient', () => {
    beforeAll(async () => {
        client = DVC.initialize('token', { logLevel: 'error', enableCloudBucketing: true })
        server.listen()
    })
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

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

        it('to throw an error if key is not defined', async () => {
            try {
                await client.variable(user, undefined as unknown as string, false)
            } catch (ex) {
                expect(ex.message).toBe(
                    'Missing parameter: key'
                )
            }
        })

        it('to throw an error if defaultValue is not defined', async () => {
            try {
                await client.variable(user, 'test-key', undefined as unknown as string)
            } catch (ex) {
                expect(ex.message).toBe(
                    'Missing parameter: defaultValue'
                )
            }
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
        it('an event successfully', () => {
            expect(async () => await client.track(user, event)).not.toThrow()
        })

        it('throws an error for a null event', () => {
            const badEvent = null
            expect(async () => await client.track(user, badEvent as unknown as DVCEvent))
            .rejects
            .toThrow('Invalid Event')
        })

        it('throws an error for a undefined event', () => {
            const badEvent = undefined
            expect(async () => await client.track(user, badEvent as unknown as DVCEvent))
            .rejects
            .toThrow('Invalid Event')
        })

        it('throws an error for an event with no type', () => {
            const badEvent = { target: 'test' }
            expect(async () => await client.track(user, badEvent as unknown as DVCEvent))
            .rejects
            .toThrow('Invalid Event')
        })

        test.each([
            '',
            7,
            false,
            { test: 'test' },
            null,
            undefined
        ])('Invalid Track (Invalid Event Type: %s)', async (type) => {
            const badEvent = { type }
            expect(async () => await client.track(user, badEvent as unknown as DVCEvent))
            .rejects
            .toThrow('Invalid Event')
        })
    })
})
import * as DVCClient from '../src'
import * as Request from '../src/Request'

jest.mock('../src/Request')
jest.spyOn(Request, 'getConfigJson').mockImplementation(() => {
    return Promise.resolve({})
})

const missingKeyError = 'Missing environment key! Call initialize with a valid environment key'
const invalidOptionsError = 'Invalid options! Call initialize with valid options'

describe('initialize tests', () => {
    it('should return client when calling initialize', () => {
        const user = { user_id: 'user1' }
        const client = DVCClient.initialize('YOUR_CLIENT_SIDE_ID', user)
        expect(client).not.toBeNull()
    })

    it('should throw an error if environment key is not passed in initialize', () => {
        expect(() => DVCClient.initialize('')).toThrow(missingKeyError)
        expect(() => DVCClient.initialize()).toThrow(missingKeyError)
    })

    it('should throw an error if user is not passed in initialize', () => {
        expect(() => DVCClient.initialize('YOUR_CLIENT_SIDE_ID')).toThrow(expect.anything())
    })

    it('should throw an error if invalid optioins are passed in initialize', () => {
        const user = { user_id: 'user1' }
        expect(() => DVCClient.initialize('YOUR_CLIENT_SIDE_ID', user, null)).toThrow(invalidOptionsError)
        expect(() => DVCClient.initialize('YOUR_CLIENT_SIDE_ID', user, false)).toThrow(invalidOptionsError)
    })

    it('should flush when pagehide is triggered', () => {
        const user = { user_id: 'bruh' }
        const client = DVCClient.initialize('YOUR_CLIENT_SIDE_ID', user)
        const flushMock = jest.fn()
        client.flushEvents = flushMock

        window.dispatchEvent(new Event('pagehide'))
        expect(flushMock).toBeCalled()
    })
})

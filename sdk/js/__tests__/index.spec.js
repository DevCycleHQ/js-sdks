import * as DVCClient from '../src'
import { getConfigJson } from '../src/Request'
import { mocked } from 'ts-jest/utils'

jest.mock('../src/Request')
mocked(getConfigJson).mockImplementation(() => {
    return Promise.resolve({})
})

describe('initialize tests', () => {
    it('should return client when calling initialize', () => {
        const user = { user_id: 'user1' }
        const client = DVCClient.initialize('YOUR_CLIENT_SIDE_ID', user)
        expect(client).not.toBeNull()
    })

    it('should throw an error if environment key is not passed in initialize', () => {
        expect(() => DVCClient.initialize('')).toThrow(expect.anything())
        expect(() => DVCClient.initialize()).toThrow(expect.anything())
    })

    it('should throw an error if user is not passed in initialize', () => {
        expect(() => DVCClient.initialize('YOUR_CLIENT_SIDE_ID')).toThrow(expect.anything())
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

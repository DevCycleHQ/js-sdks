import * as DVC from '../src'
import * as Request from '../src/Request'

jest.mock('../src/Request')
jest.spyOn(Request, 'getConfigJson').mockImplementation(() => {
    return Promise.resolve({})
})

const missingKeyError = 'Missing SDK key! Call initialize with a valid SDK key'
const missingUserError = 'Missing user! Call initialize with a valid user'
const invalidUserError =
    'Must have a user_id, or have "isAnonymous" set on the user'
const invalidOptionsError =
    'Invalid options! Call initialize with valid options'

describe('initializeDevCycle tests', () => {
    it('should return client for initialize and initializeDevCycle', () => {
        const user = { user_id: 'user1' }
        let client = DVC.initializeDevCycle('YOUR_CLIENT_SIDE_ID', user)
        expect(client).not.toBeNull()

        client = DVC.initialize('YOUR_CLIENT_SIDE_ID', user)
        expect(client).not.toBeNull()
    })

    it('should return client when calling initialize', () => {
        const user = { user_id: 'user1' }
        const client = DVC.initializeDevCycle('YOUR_CLIENT_SIDE_ID', user)
        expect(client).not.toBeNull()
    })

    it('should throw an error if SDK key is not passed in initialize', () => {
        expect(() => DVC.initializeDevCycle('')).toThrow(missingKeyError)
        expect(() => DVC.initializeDevCycle()).toThrow(missingKeyError)
    })

    it('should throw an error if user is not passed in initialize', () => {
        expect(() => DVC.initializeDevCycle('YOUR_CLIENT_SIDE_ID')).toThrow(
            missingUserError,
        )
    })

    it('should NOT throw an error if invalid user is passed in initialize', () => {
        const badUser = { who: 'me' }
        const client = DVC.initializeDevCycle('YOUR_CLIENT_SIDE_ID', badUser)
        expect(client).not.toBeNull()
    })

    it('should throw an error if invalid options are passed in initialize', () => {
        const user = { user_id: 'user1' }
        expect(() =>
            DVC.initializeDevCycle('YOUR_CLIENT_SIDE_ID', user, null),
        ).toThrow(invalidOptionsError)
        expect(() =>
            DVC.initializeDevCycle('YOUR_CLIENT_SIDE_ID', user, false),
        ).toThrow(invalidOptionsError)
    })

    it('should flush when pagehide is triggered', () => {
        const user = { user_id: 'bruh' }
        const client = DVC.initializeDevCycle('YOUR_CLIENT_SIDE_ID', user)
        const flushMock = jest.fn()
        client.flushEvents = flushMock

        window.dispatchEvent(new Event('pagehide'))
        expect(flushMock).toBeCalled()
    })
})

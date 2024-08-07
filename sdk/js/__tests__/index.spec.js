import * as DVC from '../src'
import * as Request from '../src/Request'

jest.mock('../src/Request')
jest.spyOn(Request, 'getConfigJson').mockImplementation(() => {
    return Promise.resolve({})
})

const test_key = 'client_test_sdk_key'
const missingKeyError = 'Missing SDK key! Call initialize with a valid SDK key'
const invalidKeyError =
    'Invalid SDK key! SDK key must start with "client_" or "dvc_client_"'
const missingUserError = 'Missing user! Call initialize with a valid user'
const invalidUserError =
    'Must have a user_id, or have "isAnonymous" set on the user'
const invalidOptionsError =
    'Invalid options! Call initialize with valid options'

describe('initializeDevCycle tests', () => {
    it('should return client for initialize and initializeDevCycle', () => {
        const user = { user_id: 'user1' }
        let client = DVC.initializeDevCycle(test_key, user)
        expect(client).not.toBeNull()

        client = DVC.initialize(test_key, user)
        expect(client).not.toBeNull()
    })

    it('should return client when calling initialize', () => {
        const user = { user_id: 'user1' }
        const client = DVC.initializeDevCycle(test_key, user)
        expect(client).not.toBeNull()
    })

    it('should throw an error if SDK key is not passed in initialize', () => {
        expect(() => DVC.initializeDevCycle('')).toThrow(missingKeyError)
        expect(() => DVC.initializeDevCycle()).toThrow(missingKeyError)
    })

    it('should throw an error if invalid SDK key is passed in initialize', () => {
        expect(() => DVC.initializeDevCycle('bad_key')).toThrow(invalidKeyError)
    })

    it('should throw an error if user is not passed in initialize', () => {
        expect(() => DVC.initializeDevCycle(test_key)).toThrow(missingUserError)
    })

    it('should NOT throw an error if invalid user is passed in initialize', () => {
        const badUser = { who: 'me' }
        const client = DVC.initializeDevCycle(test_key, badUser)
        expect(client).not.toBeNull()
    })

    it('should throw an error if invalid options are passed in initialize', () => {
        const user = { user_id: 'user1' }
        expect(() => DVC.initializeDevCycle(test_key, user, null)).toThrow(
            invalidOptionsError,
        )
        expect(() => DVC.initializeDevCycle(test_key, user, false)).toThrow(
            invalidOptionsError,
        )
    })

    it('should flush when pagehide is triggered', () => {
        const user = { user_id: 'bruh' }
        const client = DVC.initializeDevCycle(test_key, user)
        const flushMock = jest.fn()
        client.flushEvents = flushMock

        window.dispatchEvent(new Event('pagehide'))
        expect(flushMock).toBeCalled()
    })
})

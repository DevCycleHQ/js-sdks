import * as DVC from '../src'
import * as Request from '../src/Request'

jest.mock('../src/Request')

const test_key = 'client_test_sdk_key'
const test_server_key = 'dvc_server_key'
const missingKeyError = 'Missing SDK key! Call initialize with a valid SDK key'
const invalidKeyError =
    'Invalid SDK key provided. Please call initialize with a valid client SDK key'
const missingUserError = 'Missing user! Call initialize with a valid user'
const invalidUserError =
    'Must have a user_id, or have "isAnonymous" set on the user'
const invalidOptionsError =
    'Invalid options! Call initialize with valid options'

describe('initializeDevCycle tests', () => {
    /**
     * @type {jest.SpyInstance}
     */
    let getConfigJsonSpy

    beforeEach(() => {
        getConfigJsonSpy = jest
            .spyOn(Request, 'getConfigJson')
            .mockImplementation(() => {
                return Promise.resolve({})
            })
    })

    afterEach(() => {
        getConfigJsonSpy.mockRestore()
    })

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

    it('should not throw an error if invalid SDK key is passed in initialize when running with next option set', () => {
        const user = { user_id: 'user1' }
        expect(() =>
            DVC.initializeDevCycle(test_server_key, user, { next: 'test' }),
        ).not.toThrow(invalidKeyError)
    })

    it('should flush when pagehide is triggered', () => {
        const user = { user_id: 'bruh' }
        const client = DVC.initializeDevCycle(test_key, user)
        const flushMock = jest.fn()
        client.flushEvents = flushMock

        window.dispatchEvent(new Event('pagehide'))
        expect(flushMock).toBeCalled()
    })

    it('should not throw an error and use default config when config api throws an error', async () => {
        const user = { user_id: 'testuser' }

        getConfigJsonSpy.mockResolvedValue({
            invalidProp1: {},
            invalidProp2: [],
        })

        /** @type {DVC.DevCycleClient} */
        let client
        expect(() => {
            client = DVC.initializeDevCycle(test_key, user)
        }).not.toThrow()

        await client.onClientInitialized()
        expect(getConfigJsonSpy).toHaveBeenCalledTimes(1)
        const variable = client.variable('test', false)
        expect(variable.isDefaulted).toEqual(true)
        expect(variable.value).toEqual(false)
    })
    it('should not throw an error and use default config when deffered', async () => {
        const user = { user_id: 'testuser' }

        getConfigJsonSpy.mockResolvedValue({
            invalidProp1: {},
            invalidProp2: [],
        })

        const client = DVC.initializeDevCycle(test_key, {
            deferInitialization: true,
        })
        await expect(client.identifyUser(user)).resolves.not.toThrow()
        expect(getConfigJsonSpy).toHaveBeenCalledTimes(1)
        const variable = client.variable('test', false)
        expect(variable.isDefaulted).toEqual(true)
        expect(variable.value).toEqual(false)
    })
})

import { DevCycleClient } from '../src/Client'
import { getConfigJson, publishEvents, saveEntity } from '../src/Request'
import { mocked } from 'jest-mock'
import { DVCVariable } from '../src/Variable'
import { DVCPopulatedUser } from '../src/User'
import { StoreKey } from '../src/types'

jest.mock('../src/Request')
jest.mock('../src/StreamingConnection')

const getConfigJson_mock = mocked(getConfigJson)
const saveEntity_mock = mocked(saveEntity)

const createClientWithConfigImplementation = (implementation) => {
    getConfigJson_mock.mockImplementation(implementation)
    return new DevCycleClient('test_sdk_key', { user_id: 'user1' })
}

describe('DevCycleClient tests', () => {
    const testConfig = {
        project: {
            settings: {
                edgeDB: {
                    enabled: true,
                },
            },
        },
        environment: {},
        features: {},
        featureVariationMap: {},
        variableVariationMap: {},
        variables: {
            key: {
                _id: 'id',
                value: 'value1',
                type: 'String',
                default_value: 'default_value',
            },
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        window.localStorage.clear()
    })

    it('should make a call to get a config', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve(testConfig)
        })
        const client = new DevCycleClient('test_sdk_key', { user_id: 'user1' })
        await client.onInitialized
        expect(getConfigJson_mock).toBeCalled()
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(client.config).toStrictEqual(testConfig)
    })

    it('should establish a streaming connection if available', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve({
                ...testConfig,
                sse: { url: 'example.com' },
            })
        })
        const client = new DevCycleClient('test_sdk_key', { user_id: 'user1' })
        await client.onInitialized
        expect(getConfigJson_mock).toBeCalled()
        expect(client.streamingConnection).toBeDefined()
    })

    it('should send the edgedb parameter when enabled, then save user', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve(testConfig)
        })
        const dvcOptions = { enableEdgeDB: true }
        const client = new DevCycleClient(
            'test_sdk_key',
            { user_id: 'user1' },
            dvcOptions,
        )
        await client.onClientInitialized()
        expect(getConfigJson_mock).toBeCalledWith(
            'test_sdk_key',
            expect.objectContaining({ user_id: 'user1' }),
            expect.any(Object),
            dvcOptions,
            undefined,
        )
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(client.config).toStrictEqual(testConfig)
        expect(saveEntity_mock).toBeCalledWith(
            expect.objectContaining({ user_id: 'user1' }),
            'test_sdk_key',
            expect.any(Object),
            dvcOptions,
        )
    })

    it('should send the edgedb parameter when enabled but project disabled, not save user', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve({
                ...testConfig,
                project: { settings: { edgeDB: { enabled: false } } },
            })
        })
        const dvcOptions = { enableEdgeDB: true }
        const client = new DevCycleClient(
            'test_sdk_key',
            { user_id: 'user1' },
            dvcOptions,
        )
        await client.onClientInitialized()
        expect(getConfigJson_mock).toBeCalledWith(
            'test_sdk_key',
            expect.objectContaining({ user_id: 'user1' }),
            expect.any(Object),
            dvcOptions,
            undefined,
        )
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(saveEntity_mock).not.toBeCalled()
    })

    it('should not send the edgedb parameter when disabled but project enabled, not save user', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve(testConfig)
        })
        const dvcOptions = { enableEdgeDB: false }
        const client = new DevCycleClient(
            'test_sdk_key',
            { user_id: 'user1' },
            dvcOptions,
        )
        await client.onClientInitialized()
        expect(getConfigJson_mock).toBeCalledWith(
            'test_sdk_key',
            expect.objectContaining({ user_id: 'user1' }),
            expect.any(Object),
            dvcOptions,
            undefined,
        )
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(client.config).toStrictEqual(testConfig)
        expect(saveEntity_mock).not.toBeCalled()
    })

    it('should still return client if config request fails', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.reject(new Error('test error'))
        })
        const client = new DevCycleClient('test_sdk_key', { user_id: 'user1' })
        await client.onInitialized
        expect(getConfigJson_mock).toBeCalled()
        expect(client.config).toBeUndefined()
    })

    it('should have same value for anonymous user id from local storage and user_id if anonId exists and isAnonymous is true', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve(testConfig)
        })
        const client = new DevCycleClient('test_sdk_key', { isAnonymous: true })
        await client.onClientInitialized()
        const anonymousUserId = await client.store.store.load(
            StoreKey.AnonUserId,
        )
        expect(anonymousUserId).toEqual(client.user.user_id)
    })

    it('should not save anonymous user id in local storage if isAnonymous is false', async () => {
        const client = new DevCycleClient('test_sdk_key', {
            user_id: 'user1',
            isAnonymous: false,
        })
        const anonymousUserId = await client.store.store.load(
            StoreKey.AnonUserId,
        )
        expect(anonymousUserId).toBeUndefined()
    })

    it('should get the anonymous user id from local storage if it exists', async () => {
        window.localStorage.setItem(
            StoreKey.AnonUserId,
            JSON.stringify('test_anon_user_id'),
        )
        const client = new DevCycleClient('test_sdk_key', { isAnonymous: true })
        await client.onClientInitialized()
        expect(client.user.user_id).toEqual('test_anon_user_id')
    })

    it('should clear the anonymous user id from local storage when initialized with non-anon user', async () => {
        window.localStorage.setItem(
            StoreKey.AnonUserId,
            JSON.stringify('anon_user_id'),
        )
        const client = new DevCycleClient('test_sdk_key', { user_id: 'user1' })
        await client.onClientInitialized()
        expect(client.user.user_id).toEqual('user1')
        expect(window.localStorage.getItem(StoreKey.AnonUserId)).toBeNull()
    })

    describe('onClientInitialized', () => {
        beforeEach(() => {
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve(testConfig)
            })
        })

        it('should return promise if no callback given', () => {
            const client = new DevCycleClient('test_sdk_key', {
                user_id: 'user1',
            })
            const onInitialized = client.onClientInitialized()
            expect(onInitialized).not.toBeFalsy()
            expect(onInitialized).toBeInstanceOf(Promise)
        })

        it('should return promise if non-callback given', async () => {
            const client = new DevCycleClient('test_sdk_key', {
                user_id: 'user1',
            })
            const onInitialized = client.onClientInitialized('not a callback')
            expect(onInitialized).not.toBeFalsy()
            expect(onInitialized).toBeInstanceOf(Promise)
        })

        it('should not return promise if callback given', async () => {
            const client = new DevCycleClient('test_sdk_key', {
                user_id: 'user1',
            })
            const callback = jest.fn()
            const onInitialized = client.onClientInitialized(callback)
            expect(onInitialized).toBeFalsy()
            await client.onInitialized
            expect(callback).toBeCalled()
        })

        it('should not send a request to edgedb for an anonymous user', async () => {
            saveEntity_mock.mockResolvedValue({})

            const client = new DevCycleClient(
                'test_sdk_key',
                { isAnonymous: true },
                { enableEdgeDB: true },
            )
            await client.onClientInitialized()

            expect(getConfigJson_mock).toBeCalled()
            expect(saveEntity_mock).not.toBeCalled()
        })

        it('should save config for user', async () => {
            const client = new DevCycleClient('test_sdk_key', {
                user_id: 'user1',
            })
            await client.onClientInitialized()
            expect(
                window.localStorage.getItem(
                    `${StoreKey.IdentifiedConfig}.user_id`,
                ),
            ).toBe(JSON.stringify('user1'))
            expect(window.localStorage.getItem(StoreKey.IdentifiedConfig)).toBe(
                JSON.stringify(testConfig),
            )
        })

        it('should save config for anonymous user', async () => {
            const client = new DevCycleClient('test_sdk_key', {
                isAnonymous: true,
            })
            await client.onClientInitialized()
            expect(window.localStorage.getItem(StoreKey.AnonymousConfig)).toBe(
                JSON.stringify(testConfig),
            )
        })
    })

    describe('variable', () => {
        let client

        const createClientWithDelay = (delay) => {
            return createClientWithConfigImplementation(() => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve(testConfig), delay)
                })
            })
        }

        it('return a variable with the correct value from the config', async () => {
            client = createClientWithDelay(0)
            await client.onClientInitialized()
            const variable = client.variable('key', 'default_value')
            expect(client.variableValue('key', 'default_value')).toBe('value1')
            expect(variable.value).toBe('value1')
            expect(variable.defaultValue).toBe('default_value')
        })

        it('return the default value for the variable if the types do not match', async () => {
            client = createClientWithDelay(0)
            await client.onClientInitialized()
            const variable = client.variable('key', false)
            expect(client.variableValue('key', false)).toBe(false)
            expect(variable.value).toBe(false)
            expect(variable.defaultValue).toBe(false)
        })

        it('should create a variable if get fails to get config', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.reject(new Error('Getting config failed'))
            })
            await client.onClientInitialized()
            const variable = client.variable('key', 'default_value')
            expect(client.variableValue('key', 'default_value')).toBe(
                'default_value',
            )
            expect(variable.value).toBe('default_value')
            expect(variable.defaultValue).toBe('default_value')
        })

        it('should create a variable only if not already created', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.reject(new Error('Getting config failed'))
            })
            await client.onClientInitialized()
            const variable = client.variable('key', 'default_value')
            expect(
                client.variableDefaultMap['key']['default_value'],
            ).toBeDefined()
            client.variable('key', 'default_value')
            expect(Object.values(client.variableDefaultMap['key']).length).toBe(
                1,
            )
            expect(client.variableDefaultMap['key']['default_value']).toEqual(
                variable,
            )
            client.variableValue('key', 'default_value')
            expect(Object.values(client.variableDefaultMap['key']).length).toBe(
                1,
            )
            expect(client.variableDefaultMap['key']['default_value']).toEqual(
                variable,
            )
        })

        it('should have no value and default value if config not done fetching', () => {
            client = createClientWithDelay(500)
            const variable = client.variable('key', 'default_value')
            expect(client.variableValue('key', 'default_value')).toBe(
                'default_value',
            )
            expect(variable.value).toBe('default_value')
            expect(variable.defaultValue).toBe('default_value')
        })

        it('should add to client variable default map with different types of default values', () => {
            client = createClientWithDelay(500)
            const stringVariable = client.variable('key', 'default_value')
            const boolVariable = client.variable('key', true)
            const numVariable = client.variable('key', 12.4)
            const jsonVariable = client.variable('key', { key: 'value' })
            const variableMap = client.variableDefaultMap['key']
            expect(variableMap['default_value']).toEqual(stringVariable)
            expect(variableMap['true']).toEqual(boolVariable)
            expect(variableMap['12.4']).toEqual(numVariable)
            expect(
                variableMap[JSON.stringify(jsonVariable.defaultValue)],
            ).toEqual(jsonVariable)
            expect(Object.values(variableMap).length).toBe(4)
        })

        it('should call onUpdate after config is finished and variable is in config', (done) => {
            client = createClientWithDelay(500)
            const variable = client.variable('key', 'default_value')
            variable.onUpdate(() => done())
        })

        it('should not call onUpdate if created after config is finished', async () => {
            client = createClientWithDelay(500)
            await client.onClientInitialized()
            const variable = client.variable('key', 'default_value')
            const callback = jest.fn()
            variable.onUpdate(callback)
            expect(callback).not.toHaveBeenCalled()
        })

        it('should call onUpdate after variable updates are emitted', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfig)
            })
            await client.onClientInitialized()
            const variable = new DVCVariable({
                _id: 'id',
                key: 'key',
                value: 'my-value',
                defaultValue: 'default-value',
            })

            const onUpdate = jest.fn().mockImplementation(function (value) {
                expect(value).toBe('my-new-value')
                expect(this).toBe(variable)
            })

            variable.onUpdate(onUpdate)
            client.eventEmitter.emitVariableUpdates(
                { key: { ...variable } },
                {
                    key: {
                        ...variable,
                        value: 'my-new-value',
                    },
                },
                { key: { 'default-value': variable } },
            )

            expect(onUpdate).toBeCalledTimes(1)
        })

        it('should have same variable value with config cache and call onUpdate after config cache is updated', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfig)
            })
            const variable = client.variable('key', 'default_value')
            const onUpdate = jest.fn()
            variable.onUpdate(onUpdate)
            await client.onClientInitialized()
            const cachedConfig = await client.store.loadConfig(
                client.user,
                client.configCacheTTL,
            )
            expect(variable.value).toEqual(cachedConfig.variables.key.value)
            expect(onUpdate).toBeCalledTimes(1)
        })
    })

    describe('identifyUser', () => {
        let client

        const localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        }

        beforeEach(() => {
            localStorage.getItem.mockReset()
            localStorage.setItem.mockReset()
            localStorage.removeItem.mockReset()
            Object.setPrototypeOf(window, {
                localStorage: localStorage,
            })
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfig)
            })
        })

        it('should return a promise if no callback given', () => {
            const newUser = { user_id: 'user2' }
            const result = client.identifyUser(newUser)
            expect(result).toBeInstanceOf(Promise)
        })

        it('should not return a promise if callback given', () => {
            const newUser = { user_id: 'user2' }
            const callback = jest.fn()
            const result = client.identifyUser(newUser, callback)
            expect(result).not.toBeInstanceOf(Promise)
        })

        it('should get the config again and return new features, but not call edgedb when its disabled', async () => {
            const newUser = { user_id: 'user2' }
            const newVariables = {
                variables: {
                    variable1: {
                        key: 'abc',
                        value: 'new variable',
                    },
                },
            }
            getConfigJson_mock.mockClear()
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve({ ...testConfig, ...newVariables })
            })
            const result = await client.identifyUser(newUser)

            expect(getConfigJson).toBeCalled()
            expect(saveEntity_mock).not.toBeCalled()
            expect(result).toEqual(newVariables.variables)
        })

        it('should send a request to edgedb after getting the config', async () => {
            const newUser = { user_id: 'user1', email: 'test@example.com' }
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve(testConfig)
            })
            saveEntity_mock.mockResolvedValue({})
            const dvcOptions = { enableEdgeDB: true }
            const client = new DevCycleClient(
                'test_sdk_key',
                { user_id: 'user1' },
                dvcOptions,
            )

            await client.onClientInitialized()
            getConfigJson_mock.mockClear()
            saveEntity_mock.mockClear()
            await client.identifyUser(newUser)

            expect(getConfigJson_mock).toBeCalledWith(
                'test_sdk_key',
                expect.objectContaining({ user_id: 'user1' }),
                expect.any(Object),
                dvcOptions,
                undefined,
            )
            expect(saveEntity_mock).toBeCalledWith(
                expect.objectContaining(newUser),
                'test_sdk_key',
                expect.any(Object),
                dvcOptions,
            )
            expect(saveEntity_mock).toBeCalledWith(
                expect.any(DVCPopulatedUser),
                'test_sdk_key',
                expect.any(Object),
                dvcOptions,
            )
        })

        it('should not send a request to edgedb after getting the config for an anonymous user', async () => {
            const newUser = { isAnonymous: true, country: 'CA' }
            getConfigJson_mock.mockResolvedValue(testConfig)
            saveEntity_mock.mockResolvedValue({})

            const client = new DevCycleClient(
                'test_sdk_key',
                new DVCPopulatedUser({ isAnonymous: true }),
                {
                    enableEdgeDB: true,
                },
            )
            await client.onClientInitialized()
            getConfigJson_mock.mockClear()
            saveEntity_mock.mockClear()
            await client.identifyUser(newUser)

            expect(getConfigJson_mock).toBeCalled()
            expect(saveEntity_mock).not.toBeCalled()
        })

        it('should throw an error if the user is invalid', async () => {
            await expect(client.identifyUser({ user_id: '' })).rejects.toThrow(
                new Error(
                    'A User cannot be created with a user_id that is an empty string',
                ),
            )
        })

        it('should flush events before identifying user', async () => {
            const newUser = { user_id: 'user2' }

            client.track({ type: 'test' })
            await client.onClientInitialized()

            await client.identifyUser(newUser)

            expect(publishEvents).toBeCalled()
        })

        it('should clear existing anon user id from local storage when client initialize is delayed', async () => {
            const newUser = { user_id: 'user2' }
            client = createClientWithConfigImplementation(() =>
                setTimeout(() => Promise.resolve(testConfig), 1000),
            )
            client.store.store.save(StoreKey.AnonUserId, 'anon-user-id')

            await client.identifyUser(newUser)
            const anonUser = await client.store.store.load(StoreKey.AnonUserId)

            expect(anonUser).toBeUndefined()
        })

        it('should not clear existing anon user id if called with anon user', async () => {
            getConfigJson_mock.mockResolvedValue(testConfig)

            const client = new DevCycleClient('test_sdk_key', {
                isAnonymous: true,
            })

            await client.onClientInitialized()
            const originalAnonUserId = client.user.user_id
            await client.identifyUser({ isAnonymous: true })
            const anonUserId = await client.store.store.load(
                StoreKey.AnonUserId,
            )

            expect(anonUserId).toBe(originalAnonUserId)
            expect(anonUserId).not.toBe(null)
        })
    })

    describe('resetUser', () => {
        let client

        const localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
        }

        beforeEach(() => {
            localStorage.getItem.mockReset()
            localStorage.setItem.mockReset()
            Object.setPrototypeOf(window, {
                localStorage: localStorage,
            })

            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfig)
            })
        })

        it('should return a promise if no callback given', () => {
            const result = client.resetUser()
            expect(result).toBeInstanceOf(Promise)
        })

        it('should not return a promise if callback given', () => {
            const callback = jest.fn()
            const result = client.resetUser(callback)
            expect(result).not.toBeInstanceOf(Promise)
        })

        it('should get the config again and return new features after resetting', async () => {
            const newVariables = {
                variables: {
                    variable1: {
                        key: 'abc',
                        value: 'new variable',
                    },
                },
            }
            getConfigJson_mock.mockClear()
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve({ ...testConfig, ...newVariables })
            })
            const result = await client.resetUser()
            const anonUser = getConfigJson.mock.calls[0][1]

            expect(getConfigJson).toBeCalledWith(
                'test_sdk_key',
                expect.objectContaining(anonUser),
                expect.any(Object),
                {},
                undefined,
            )
            expect(result).toEqual(newVariables.variables)
            expect(anonUser.isAnonymous).toBe(true)
        })

        it('should not send a request to edgedb after getting the config, and not send edgedb param', async () => {
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve(testConfig)
            })
            saveEntity_mock.mockResolvedValue({})
            const dvcOptions = { enableEdgeDB: true }
            const client = new DevCycleClient(
                'test_sdk_key',
                { user_id: 'user1' },
                dvcOptions,
            )
            await client.onClientInitialized()
            getConfigJson_mock.mockClear()
            saveEntity_mock.mockClear()
            await client.resetUser()

            expect(getConfigJson).toBeCalledWith(
                'test_sdk_key',
                expect.objectContaining({ user_id: expect.any(String) }),
                expect.any(Object),
                dvcOptions,
                undefined,
            )
            expect(saveEntity_mock).not.toBeCalled()
        })

        it('should flush events before resetting user', async () => {
            client.track({ type: 'test' })
            await client.onClientInitialized()

            await client.resetUser()

            expect(publishEvents).toBeCalled()
        })

        it('should remove anonymous user id from local storage', async () => {
            const client = new DevCycleClient('test_sdk_key', {
                isAnonymous: true,
            })
            await client.onClientInitialized()
            const oldAnonymousId = await client.store.store.load(
                StoreKey.AnonUserId,
            )
            expect(oldAnonymousId).toBeTruthy()

            await client.resetUser()
            const newAnonymousId = await client.store.store.load(
                StoreKey.AnonUserId,
            )
            expect(oldAnonymousId).not.toEqual(newAnonymousId)
            expect(client.user.user_id).toEqual(newAnonymousId)
        })
    })

    describe('allFeatures', () => {
        const testConfigWithFeatures = {
            ...testConfig,
            features: {
                key: 'featureKey',
                name: 'Feature Flag',
                segmented: true,
                evaluationReason: {},
            },
        }
        let client

        it('should return all features', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfigWithFeatures)
            })
            await client.onClientInitialized()
            const features = client.allFeatures()
            expect(features).toStrictEqual(testConfigWithFeatures.features)
        })

        it('should return empty object if no config', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve({})
            })
            await client.onClientInitialized()
            const features = client.allFeatures()
            expect(features).toStrictEqual({})
        })
    })

    describe('allVariables', () => {
        const testConfigWithVariables = {
            ...testConfig,
            variables: {
                key: 'variableKey',
                value: 'value 1',
                defaultValue: 'default',
                evaluationReason: {},
            },
        }
        let client

        it('should return all features', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfigWithVariables)
            })
            await client.onClientInitialized()
            const variables = client.allVariables()
            expect(variables).toStrictEqual(testConfigWithVariables.variables)
        })

        it('should return empty object if no config', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve({})
            })
            await client.onClientInitialized()
            const variables = client.allVariables()
            expect(variables).toStrictEqual({})
        })
    })

    describe('track', () => {
        let client
        beforeEach(async () => {
            client = new DevCycleClient('test_sdk_key', { user_id: 'user1' })
            await client.onClientInitialized()
            jest.spyOn(client.eventQueue, 'queueEvent')
        })

        it('should throw if no type given', async () => {
            expect(() => client.track({})).toThrow(expect.any(Error))
        })

        it('should queue a valid event', async () => {
            client.track({ type: 'test' })
            await new Promise((resolve) => setTimeout(resolve, 0))
            expect(client.eventQueue.queueEvent).toHaveBeenCalledWith({
                type: 'test',
            })
        })

        it('should prevent tracking if close has been called', async () => {
            client.close()
            client.track({ type: 'test' })
            await new Promise((resolve) => setTimeout(resolve, 0))
            expect(client.eventQueue.queueEvent).not.toHaveBeenCalled()
        })
    })

    describe('flushEvents', () => {
        let client
        beforeEach(() => {
            setup()
        })
        const setup = () => {
            publishEvents.mockReset()
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfig)
            })
            publishEvents.mockResolvedValue({ status: 201 })
        }
        it('should callback with callback if passed in', async () => {
            const event = { type: 'test_type' }
            const callback = jest.fn()
            client.eventQueue.queueEvent(event)
            await client.flushEvents(callback)

            expect(callback).toBeCalled()
        })

        it('should callback with callback if passed in', async () => {
            const event = { type: 'test_type' }
            client.eventQueue.queueEvent(event)
            const flushPromise = client.flushEvents()
            expect(flushPromise).toBeInstanceOf(Promise)
        })
    })

    describe('close', () => {
        let client
        beforeEach(async () => {
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve({
                    ...testConfig,
                    sse: { url: 'example.com' },
                })
            })
            client = new DevCycleClient('test_sdk_key', { user_id: 'user1' })
            await client.onClientInitialized()
            jest.spyOn(client.eventQueue, 'close')
        })

        it('closes all resources and flushes pending events', async () => {
            const removeListener = jest.spyOn(document, 'removeEventListener')

            await client.close()
            expect(client.eventQueue.close).toHaveBeenCalled()
            expect(client.streamingConnection.close).toHaveBeenCalled()
            expect(removeListener).toHaveBeenCalled()
        })
    })

    describe('deferred mode', () => {
        it('does not send config or resolve initialization until identify', async () => {
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve(testConfig)
            })
            const client = new DevCycleClient('test_sdk_key', {
                deferInitialization: true,
            })
            await new Promise((resolve) => setTimeout(resolve, 10))
            expect(getConfigJson_mock).not.toBeCalled()
            expect(
                await Promise.race([
                    client.onInitialized,
                    new Promise((resolve) =>
                        setTimeout(() => resolve('timed out'), 10),
                    ),
                ]),
            ).toEqual('timed out')
            expect(client.user).toBeUndefined()
            await client.identifyUser({ user_id: 'test' })
            await client.onInitialized
            expect(getConfigJson_mock).toBeCalledWith(
                'test_sdk_key',
                expect.objectContaining({ user_id: 'test' }),
                expect.anything(),
                expect.anything(),
                undefined,
            )
            expect(getConfigJson_mock.mock.calls.length).toBe(1)
            expect(client.config).toStrictEqual(testConfig)
        })

        it('identifies correctly after initial identify', async () => {
            const configForUser2 = { ...testConfig, forUser2: true }
            getConfigJson_mock.mockImplementation((key, user) => {
                return Promise.resolve(
                    user.user_id === 'test2' ? configForUser2 : testConfig,
                )
            })
            const client = new DevCycleClient('test_sdk_key', {
                deferInitialization: true,
            })
            await new Promise((resolve) => setTimeout(resolve, 10))
            await client.identifyUser({ user_id: 'test' })
            await client.onInitialized
            await client.identifyUser({ user_id: 'test2' })
            expect(getConfigJson_mock).toBeCalledWith(
                'test_sdk_key',
                expect.objectContaining({ user_id: 'test2' }),
                expect.anything(),
                expect.anything(),
                undefined,
            )
            expect(getConfigJson_mock.mock.calls.length).toBe(2)
            expect(client.config).toStrictEqual(configForUser2)
        })

        it('works in deferred mode before identify', async () => {
            publishEvents.mockResolvedValue({ status: 201 })
            const configForUser2 = { ...testConfig, forUser2: true }
            getConfigJson_mock.mockImplementation((key, user) => {
                return Promise.resolve(
                    user.user_id === 'test2' ? configForUser2 : testConfig,
                )
            })
            const client = new DevCycleClient('test_sdk_key', {
                deferInitialization: true,
            })

            expect(client.variable('test', false)).toEqual(
                expect.objectContaining({
                    value: false,
                    isDefaulted: true,
                }),
            )
            expect(client.allVariables()).toEqual({})
            expect(client.allFeatures()).toEqual({})
            client.track({ type: 'test' })
            await client.flushEvents()
            // no events should be flushed until the user is identified
            expect(publishEvents).not.toHaveBeenCalled()
            await client.identifyUser({ user_id: 'test' })
            await client.flushEvents()
            expect(publishEvents).toHaveBeenCalledWith(
                'test_sdk_key',
                testConfig,
                expect.objectContaining({ user_id: 'test' }),
                [
                    { type: 'test' },
                    expect.objectContaining({ type: 'variableDefaulted' }),
                ],
                expect.anything(),
            )
        })
    })
})

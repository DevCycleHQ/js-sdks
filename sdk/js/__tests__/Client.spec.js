import { DVCClient } from '../src/Client'
import { getConfigJson, publishEvents, saveEntity } from '../src/Request'
import { mocked } from 'ts-jest/utils'
import { DVCVariable } from '../src/Variable'
import { DVCPopulatedUser } from '../src/User'

jest.mock('../src/Request')
const getConfigJson_mock = mocked(getConfigJson)
const saveEntity_mock = mocked(saveEntity)

const createClientWithConfigImplementation = (implementation) => {
    getConfigJson_mock.mockImplementation(implementation)
    return new DVCClient('test_env_key', { user_id: 'user1' })
}

describe('DVCClient tests', () => {
    const testConfig = {
        project: {
            settings: {
                edgeDB: {
                    enabled: true
                }
            }
        },
        environment: {},
        features: {},
        featureVariationMap: {},
        variables: {
            key: {
                _id: 'id',
                value: 'value1',
                default_value: 'default_value'
            }
        }
    }

    beforeEach(() => {
        getConfigJson_mock.mockClear()
        saveEntity_mock.mockClear()
        window.localStorage.clear()
    })

    it('should make a call to get a config', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve(testConfig)
        })
        const client = new DVCClient('test_env_key', { user_id: 'user1' })
        expect(getConfigJson_mock).toBeCalled()
        await client.onInitialized
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(client.config).toStrictEqual(testConfig)
    })

    it('should send the edgedb parameter when enabled, then save user', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve(testConfig)
        })
        const client = new DVCClient('test_env_key', { user_id: 'user1' }, { enableEdgeDB: true })
        expect(getConfigJson_mock).toBeCalledWith(
            'test_env_key',
            expect.objectContaining({ user_id: 'user1' }),
            true,
            expect.any(Object)
        )
        await client.onClientInitialized()
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(client.config).toStrictEqual(testConfig)
        expect(saveEntity_mock).toBeCalledWith(
            expect.objectContaining({ user_id: 'user1' }),
            'test_env_key',
            expect.any(Object)
        )
    })

    it('should send the edgedb parameter when enabled but project disabled, not save user', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve({ ...testConfig, project: { settings: { edgeDB: { enabled: false } } } })
        })
        const client = new DVCClient('test_env_key', { user_id: 'user1' }, { enableEdgeDB: true })
        expect(getConfigJson_mock).toBeCalledWith(
            'test_env_key',
            expect.objectContaining({ user_id: 'user1' }),
            true,
            expect.any(Object)
        )
        await client.onClientInitialized()
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(saveEntity_mock).not.toBeCalled()
    })

    it('should not send the edgedb parameter when disabled but project enabled, not save user', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.resolve(testConfig)
        })
        const client = new DVCClient('test_env_key', { user_id: 'user1' }, { enableEdgeDB: false })
        expect(getConfigJson_mock).toBeCalledWith(
            'test_env_key',
            expect.objectContaining({ user_id: 'user1' }),
            false,
            expect.any(Object)
        )
        await client.onClientInitialized()
        expect(getConfigJson_mock.mock.calls.length).toBe(1)
        expect(client.config).toStrictEqual(testConfig)
        expect(saveEntity_mock).not.toBeCalled()
    })

    it('should still return client if config request fails', async () => {
        getConfigJson_mock.mockImplementation(() => {
            return Promise.reject(new Error('test error'))
        })
        const client = new DVCClient('test_env_key', { user_id: 'user1' })
        expect(getConfigJson_mock).toBeCalled()
        await client.onInitialized
        expect(client.config).toBeUndefined()
    })

    describe('onClientInitialized', () => {
        beforeEach(() => {
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve(testConfig)
            })
        })

        it('should return promise if no callback given', () => {
            const client = new DVCClient('test_env_key', { user_id: 'user1' })
            const onInitialized = client.onClientInitialized()
            expect(onInitialized).not.toBeFalsy()
            expect(onInitialized).toBeInstanceOf(Promise)
        })

        it('should return promise if non-callback given', async () => {
            const client = new DVCClient('test_env_key', { user_id: 'user1' })
            const onInitialized = client.onClientInitialized('not a callback')
            expect(onInitialized).not.toBeFalsy()
            expect(onInitialized).toBeInstanceOf(Promise)
        })

        it('should not return promise if callback given', async () => {
            const client = new DVCClient('test_env_key', { user_id: 'user1' })
            const callback = jest.fn()
            const onInitialized = client.onClientInitialized(callback)
            expect(onInitialized).toBeFalsy()
            await client.onInitialized
            expect(callback).toBeCalled()
        })

        it('should not send a request to edgedb for an anonymous user', async () => {
            saveEntity_mock.mockResolvedValue({})

            const client = new DVCClient('test_env_key',
                new DVCPopulatedUser({ isAnonymous: true }),
                { enableEdgeDB: true }
            )
            await client.onClientInitialized()

            expect(getConfigJson_mock).toBeCalled()
            expect(saveEntity_mock).not.toBeCalled()
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

        it('should create a variable if get fails to get config', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.reject(new Error('Getting config failed'))
            })
            await client.onClientInitialized()
            const variable = client.variable('key', 'default_value')
            expect(variable.value).toBe('default_value')
            expect(variable.defaultValue).toBe('default_value')
        })

        it('should create a variable only if not already created', async () => {
            client = createClientWithConfigImplementation(() => {
                return Promise.reject(new Error('Getting config failed'))
            })
            await client.onClientInitialized()
            const variable = client.variable('key', 'default_value')
            expect(client.variableDefaultMap['key']['default_value']).toBeDefined()
            client.variable('key', 'default_value')
            expect(Object.values(client.variableDefaultMap['key']).length).toBe(1)
            expect(client.variableDefaultMap['key']['default_value']).toEqual(variable)
        })

        it('should have no value and default value if config not done fetching', () => {
            client = createClientWithDelay(500)
            const variable = client.variable('key', 'default_value')
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
            console.log('variableMap', variableMap)
            expect(variableMap['default_value']).toEqual(stringVariable)
            expect(variableMap['true']).toEqual(boolVariable)
            expect(variableMap['12.4']).toEqual(numVariable)
            expect(variableMap[JSON.stringify(jsonVariable.defaultValue)]).toEqual(jsonVariable)
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

        it('should call onUpdate after variable updates are emitted', (done) => {
            client = createClientWithConfigImplementation(() => {
                return Promise.resolve(testConfig)
            })
            const variable = new DVCVariable({
                _id: 'id',
                key: 'key',
                value: 'my-value',
                defaultValue: 'default-value'
            })
            function onUpdate(value) {
                expect(value).toBe('my-new-value')
                expect(this).toBe(variable)
                done()
            }
            variable.onUpdate(onUpdate)
            client.eventEmitter.emitVariableUpdates({ 'key': variable }, {
                'key': {
                    ...variable,
                    value: 'my-new-value'
                }
            }, { 'key': { 'default-value': variable } })
        })

    })

    describe('identifyUser', () => {
        let client

        beforeEach(() => {
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

        it('should get the config again and return new features, but not call edgedb', async () => {
            const newUser = { user_id: 'user2' }
            const newVariables = {
                variables: {
                    variable1: {
                        key: 'abc',
                        value: 'new variable'
                    }
                }
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
            const newUser = { user_id: 'user2' }
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve(testConfig)
            })
            saveEntity_mock.mockResolvedValue({})
            const client = new DVCClient('test_env_key', { user_id: 'user1' }, { enableEdgeDB: true })
            await client.onClientInitialized()
            getConfigJson_mock.mockClear()
            saveEntity_mock.mockClear()
            await client.identifyUser(newUser)

            expect(getConfigJson_mock).toBeCalledWith(
                'test_env_key',
                expect.objectContaining({ user_id: 'user2' }),
                true,
                expect.any(Object)
            )
            expect(saveEntity_mock).toBeCalledWith(
                expect.objectContaining(newUser),
                'test_env_key',
                expect.any(Object)
            )
            expect(saveEntity_mock).toBeCalledWith(expect.any(DVCPopulatedUser), 'test_env_key', expect.any(Object))
        })

        it('should not send a request to edgedb after getting the config for an anonymous user', async () => {
            const newUser = { isAnonymous: true, country: 'CA' }
            getConfigJson_mock.mockResolvedValue(testConfig)
            saveEntity_mock.mockResolvedValue({})

            const client = new DVCClient('test_env_key',
                new DVCPopulatedUser({ isAnonymous: true }),
                { enableEdgeDB: true }
            )
            await client.onClientInitialized()
            getConfigJson_mock.mockClear()
            saveEntity_mock.mockClear()
            await client.identifyUser(newUser)

            expect(getConfigJson_mock).toBeCalled()
            expect(saveEntity_mock).not.toBeCalled()
        })

        it('should throw an error if the user is invalid', async () => {
            await expect(client.identifyUser({}))
                .rejects
                .toThrow(new Error('Must have a user_id, or have "isAnonymous" set on the user'))
        })

        it('should flush events before identifying user', async () => {
            const newUser = { user_id: 'user2' }

            client.track({ type: 'test' })
            await client.onClientInitialized()

            await client.identifyUser(newUser)

            expect(publishEvents).toBeCalled()
        })
    })

    describe('resetUser', () => {
        let client

        const localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn()
        }

        beforeEach(() => {
            localStorage.getItem.mockReset()
            localStorage.setItem.mockReset()
            window.localStorage = localStorage

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
                        value: 'new variable'
                    }
                }
            }
            getConfigJson_mock.mockClear()
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve({ ...testConfig, ...newVariables })
            })
            const result = await client.resetUser()
            const anonUser = getConfigJson.mock.calls[0][1]

            expect(getConfigJson).toBeCalledWith(
                'test_env_key',
                expect.objectContaining(anonUser),
                false,
                expect.any(Object)
            )
            expect(result).toEqual(newVariables.variables)
            expect(anonUser.isAnonymous).toBe(true)
        })

        it('should not send a request to edgedb after getting the config, and not send edgedb param', async () => {
            getConfigJson_mock.mockImplementation(() => {
                return Promise.resolve(testConfig)
            })
            saveEntity_mock.mockResolvedValue({})
            const client = new DVCClient('test_env_key', { user_id: 'user1' }, { enableEdgeDB: true })
            await client.onClientInitialized()
            getConfigJson_mock.mockClear()
            saveEntity_mock.mockClear()
            await client.resetUser()

            expect(getConfigJson).toBeCalledWith(
                'test_env_key',
                expect.objectContaining({ user_id: expect.any(String) }),
                false,
                expect.any(Object)
            )
            expect(saveEntity_mock).not.toBeCalled()
        })

        it('should flush events before resetting user', async () => {
            client.track({ type: 'test' })
            await client.onClientInitialized()

            await client.resetUser()

            expect(publishEvents).toBeCalled()
        })
    })

    describe('allFeatures', () => {
        const testConfigWithFeatures = {
            ...testConfig,
            features: {
                key: 'featureKey',
                name: 'Feature Flag',
                segmented: true,
                evaluationReason: {}
            }
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
                evaluationReason: {}
            }
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
        it('should throw if no type given', async () => {
            expect(() => client.track({})).toThrow(expect.any(Error))
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
})

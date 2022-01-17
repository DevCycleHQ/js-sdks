import { DVCClient } from '../Client'
import { getConfigJson, publishEvents } from '../Request'
import { mocked } from 'ts-jest/utils'

jest.mock('../Request')
const getConfigJson_mock = mocked(getConfigJson)

beforeEach(() => {
    getConfigJson_mock.mockClear()
    window.localStorage.clear()
})

const createClientWithConfigImplementation = (implementation) => {
    getConfigJson_mock.mockImplementation(implementation)
    return new DVCClient('test_env_key', { user_id: 'user1' })
}

describe('DVCClient tests', () => {
    const testConfig = {
        project: {},
        environment: {},
        features: {},
        featureVariationMap: {},
        variables: {}
    }

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
    })

    describe('variable', () => {
        let client

        const createClientWithDelay = (done, delay) => {
            return createClientWithConfigImplementation(async () => {
                await new Promise((resolve) => {
                    setTimeout(() => resolve(testConfig), delay)
                })
                done()
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

        it('should have no value and default value if config not done fetching', (done) => {
            client = createClientWithDelay(done, 500)
            const variable = client.variable('key', 'default_value')
            expect(variable.value).toBe('default_value')
            expect(variable.defaultValue).toBe('default_value')
        })

        it('should add to client variables array', (done) => {
            client = createClientWithDelay(done, 500)
            const variable = client.variable('key', 'default_value')
            expect(client.variables).toContainEqual(variable)
        })

        it('should call onUpdate after config is finished', (done) => {
            client = createClientWithDelay(done, 500)
            const variable = client.variable('key', 'default_value')
            variable.onUpdate(() => done())
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

        it('should get the config again and return new features', async () => {
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
            expect(result).toEqual(newVariables.variables)
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

            expect(getConfigJson).toBeCalled()
            expect(result).toEqual(newVariables.variables)
            expect(anonUser.isAnonymous).toBe(true)
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

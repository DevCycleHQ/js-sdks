import { EvalHook } from '@devcycle/js-cloud-server-sdk'
import {
    DevCycleCloudClient,
    DevCycleProvider,
    initializeDevCycle,
} from '../src/index'
import { OpenFeature } from '@openfeature/server-sdk'

jest.mock('../src/bucketing')
jest.mock('@devcycle/config-manager')

describe('NodeJS SDK Initialize', () => {
    afterAll(() => {
        jest.clearAllMocks()
    })

    it('successfully calls initialize with no options', async () => {
        const client = await initializeDevCycle(
            'dvc_server_token',
        ).onClientInitialized()
        expect(client).toBeDefined()
    })

    it('successfully creates a OpenFeature provider from dvcClient - local', async () => {
        const provider = await initializeDevCycle(
            'dvc_server_token',
        ).getOpenFeatureProvider()
        expect(provider).toBeDefined()
        await OpenFeature.setProviderAndWait(provider)
        expect(provider.status).toBe('READY')
        const client = OpenFeature.getClient()
        expect(client).toBeDefined()
    })

    it('successfully creates a OpenFeature provider - local', async () => {
        const provider = new DevCycleProvider('dvc_server_token')
        await OpenFeature.setProviderAndWait(provider)
        expect(provider.status).toBe('READY')
        const client = OpenFeature.getClient()
        expect(client).toBeDefined()
    })

    it('successfully creates a OpenFeature provider from dvcClient - cloud', async () => {
        const provider = await initializeDevCycle('dvc_server_token', {
            enableCloudBucketing: true,
        }).getOpenFeatureProvider()
        expect(provider).toBeDefined()
        expect(provider.status).toBe('READY') // onIntialized() is always true for cloud
        await OpenFeature.setProviderAndWait(provider)
        expect(provider.status).toBe('READY')
        const client = OpenFeature.getClient()
        expect(client).toBeDefined()
    })

    it('successfully creates a OpenFeature provider - cloud', async () => {
        const provider = new DevCycleProvider('dvc_server_token', {
            enableCloudBucketing: true,
        })
        expect(provider.status).toBe('READY') // onIntialized() is always true for cloud
        await OpenFeature.setProviderAndWait(provider)
        expect(provider.status).toBe('READY')
        const client = OpenFeature.getClient()
        expect(client).toBeDefined()
    })

    it('fails to initialize in Local Bucketing mode when no token is provided', () => {
        expect(() =>
            initializeDevCycle(undefined as unknown as string),
        ).toThrow('Missing SDK key! Call initialize with a valid SDK key')
    })

    it('fails to initialize in Local Bucketing mode when client token is provided', () => {
        expect(() => initializeDevCycle('dvc_client_token')).toThrow(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    })

    it('sucessfully calls initialize with enableCloudBucketing set to true', () => {
        const client: DevCycleCloudClient = initializeDevCycle(
            'dvc_server_token',
            {
                enableCloudBucketing: true,
            },
        )
        expect(client).toBeDefined()
    })

    it('fails to initialize in Cloud Bucketing mode when no token is provided', () => {
        expect(() =>
            initializeDevCycle(undefined as unknown as string, {
                enableCloudBucketing: true,
            }),
        ).toThrow('Missing SDK key! Call initialize with a valid SDK key')
    })
})

describe('NodeJS Cloud SDK Initialize with hooks', () => {
    describe('hooks', () => {
        beforeEach(() => {
            jest.spyOn(global, 'fetch').mockImplementation(() => {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            key: 'test-key',
                            type: 'String',
                            value: 'test',
                        }),
                    status: 200,
                } as Response)
            })
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        it('should run hooks in correct order', async () => {
            const client = await initializeDevCycle('dvc_server_token', {
                enableCloudBucketing: true,
            })
            const user = {
                user_id: 'node_sdk_test',
                country: 'CA',
            }
            const before = jest.fn()
            const after = jest.fn()
            const onFinally = jest.fn()
            const error = jest.fn()
            client.addHook(new EvalHook(before, after, onFinally, error))
            const variable = await client.variable(user, 'test-key', 'test')
            expect(variable.value).toEqual('test')
            expect(before).toHaveBeenCalled()
            expect(after).toHaveBeenCalled()
            expect(onFinally).toHaveBeenCalled()
            expect(error).not.toHaveBeenCalled()
        })

        it('should return a variable if a before hook errors', async () => {
            const client = await initializeDevCycle('dvc_server_token', {
                enableCloudBucketing: true,
            })
            const user = {
                user_id: 'node_sdk_test',
                country: 'CA',
            }
            const before = jest.fn(() => {
                throw new Error('test')
            })
            const after = jest.fn()
            const onFinally = jest.fn()
            const error = jest.fn()
            client.addHook(new EvalHook(before, after, onFinally, error))
            const variable = await client.variable(user, 'test-key', 'test')
            expect(variable.value).toEqual('test')
            expect(variable.isDefaulted).toEqual(false)
            expect(before).toHaveBeenCalled()
            expect(after).not.toHaveBeenCalled()
            expect(onFinally).toHaveBeenCalled()
            expect(error).toHaveBeenCalled()
        })

        it('should return a variable if an after hook errors', async () => {
            const client = await initializeDevCycle('dvc_server_token', {
                enableCloudBucketing: true,
            })
            const user = {
                user_id: 'node_sdk_test',
                country: 'CA',
            }
            const before = jest.fn()
            const after = jest.fn(() => {
                throw new Error('test')
            })
            const onFinally = jest.fn()
            const error = jest.fn()
            client.addHook(new EvalHook(before, after, onFinally, error))
            const variable = await client.variable(user, 'test-key', 'test')
            expect(variable.value).toEqual('test')
            expect(variable.isDefaulted).toEqual(false)
            expect(before).toHaveBeenCalled()
            expect(after).toHaveBeenCalled()
            expect(onFinally).toHaveBeenCalled()
            expect(error).toHaveBeenCalled()
        })

        it('should return a variable if an onFinally hook errors', async () => {
            const client = await initializeDevCycle('dvc_server_token', {
                enableCloudBucketing: true,
            })
            const user = {
                user_id: 'node_sdk_test',
                country: 'CA',
            }
            const before = jest.fn()
            const after = jest.fn()
            const onFinally = jest.fn(() => {
                throw new Error('test')
            })
            const error = jest.fn()
            client.addHook(new EvalHook(before, after, onFinally, error))
            const variable = await client.variable(user, 'test-key', 'test')
            expect(variable.value).toEqual('test')
            expect(variable.isDefaulted).toEqual(false)
            expect(before).toHaveBeenCalled()
            expect(after).toHaveBeenCalled()
            expect(onFinally).toHaveBeenCalled()
        })

        it('should return a variable if an error hook errors', async () => {
            const client = await initializeDevCycle('dvc_server_token', {
                enableCloudBucketing: true,
            })
            const user = {
                user_id: 'node_sdk_test',
                country: 'CA',
            }
            const before = jest.fn()
            const after = jest.fn(() => {
                throw new Error('test')
            })
            const onFinally = jest.fn()
            const error = jest.fn(() => {
                throw new Error('test')
            })
            client.addHook(new EvalHook(before, after, onFinally, error))
            const variable = await client.variable(user, 'test-key', 'test')
            expect(variable.value).toEqual('test')
            expect(variable.isDefaulted).toEqual(false)
            expect(before).toHaveBeenCalled()
            expect(after).toHaveBeenCalled()
            expect(onFinally).toHaveBeenCalled()
        })
    })
})

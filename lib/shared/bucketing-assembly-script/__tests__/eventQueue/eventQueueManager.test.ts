import {
    setPlatformData,
    clearPlatformData,
    setConfigData,
    initEventQueue as initEventQueue_AS,
    flushEventQueue as flushEventQueue_AS,
    onPayloadSuccess,
    onPayloadFailure,
    queueEvent as queueEvent_AS,
    queueAggregateEvent as queueAggregateEvent_AS,
    cleanupEventQueue,
    eventQueueSize as eventQueueSize_AS
} from '../bucketingImportHelper'
import { FlushPayload } from '../../assembly/types'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData

let currentEnvKey: string | null = null
const initEventQueue = (envKey: unknown, options: unknown) => {
    currentEnvKey = envKey as string
    initEventQueue_AS(envKey as string, JSON.stringify(options))
}

const flushEventQueue = (envKey: string): FlushPayload[] => {
    const flushPayloadsStr = flushEventQueue_AS(envKey)
    return JSON.parse(flushPayloadsStr) as FlushPayload[]
}

const queueEvent = (envKey: string, user: unknown, event: unknown) => {
    return queueEvent_AS(envKey, JSON.stringify(user), JSON.stringify(event))
}

const queueAggregateEvent = (envKey: string, event: unknown, variableVariationMap: unknown) => {
    return queueAggregateEvent_AS(envKey, JSON.stringify(event), JSON.stringify(variableVariationMap))
}

const eventQueueSize = (envKey: string): number => {
    return eventQueueSize_AS(envKey)
}

const initSDK = (envKey: string, eventOptions: unknown = {}) => {
    initEventQueue(envKey, eventOptions)
    setPlatformData(JSON.stringify({
        platform: 'NodeJS',
        platformVersion: '16.0',
        sdkType: 'server',
        sdkVersion: '1.0.0',
        hostname: 'host.name'
    }))
    setConfigData(envKey, JSON.stringify(config))
}

describe('EventQueueManager Tests', () => {
    afterEach(() => {
        clearPlatformData('')
        if (currentEnvKey) {
            cleanupEventQueue(currentEnvKey)
            currentEnvKey = null
        }
    })

    describe('initEventQueue', () => {
        it('should init EventQueue without any options', () => {
            initEventQueue('env_key_test', {})
        })

        it('should throw error if no envKey', () => {
            expect(() => initEventQueue(undefined, undefined)).toThrow('value must not be null')
        })

        it('should throw error if no options', () => {
            expect(() => initEventQueue('env_key_test_2', undefined)).toThrow('value must not be null')
        })

        it('should throw if EnvQueue already setup for envKey', () => {
            initEventQueue('env_key_test_3', {})
            expect(() => initEventQueue('env_key_test_3', {}))
                .toThrow('Event Queue already exists for envKey')
        })

        it('should let you setup multiple EventQueues for multiple envKeys', () => {
            initEventQueue('env_key_test_4', {})
            initEventQueue('env_key_test_5', {})
            initEventQueue('env_key_test_6', {})
            initEventQueue('env_key_test_7', {})
        })

        it('should throw if eventRequestChunkSize is < 10', () => {
            expect(() => initEventQueue('env_key_eventRequestChunkSize', { eventRequestChunkSize: 9 }))
                .toThrow('eventRequestChunkSize: 9 must be larger than 10')
        })

        it('should throw if eventRequestChunkSize is > 20,000', () => {
            expect(() => initEventQueue('env_key_eventRequestChunkSize', { eventRequestChunkSize: 900000 }))
                .toThrow('eventRequestChunkSize: 900000 must be smaller than 10000')
        })
    })

    describe('flushEventQueue', () => {
        const dvcUser = { user_id: 'user_id' }

        it('should flush queued events', () => {
            const envKey = 'env_key_flush_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' }
            }
            const aggEvent = {
                type: 'aggVariableDefaulted',
                target: 'variableKey'
            }

            initSDK(envKey)
            queueEvent(envKey, dvcUser, event)
            queueAggregateEvent(envKey, aggEvent, {})
            expect(eventQueueSize(envKey)).toEqual(2)
            expect(flushEventQueue(envKey)).toEqual(expect.arrayContaining([
                {
                    'payloadId': expect.any(String),
                    'eventCount': 2,
                    'records': [
                        {
                            'events': [{
                                'clientDate': expect.any(String),
                                'customType': 'testType',
                                'date': expect.any(String),
                                'featureVars': {},
                                'metaData': { 'test': 'data' },
                                'target': 'testTarget',
                                'type': 'customEvent',
                                'user_id': 'user_id',
                                'value': 10,
                            }],
                            'user': {
                                'createdDate': expect.any(String),
                                'lastSeenDate': expect.any(String),
                                'platform': 'NodeJS',
                                'platformVersion': '16.0',
                                'sdkType': 'server',
                                'sdkVersion': '1.0.0',
                                'user_id': 'user_id',
                            }
                        },
                        {
                            'events': [{
                                'clientDate': expect.any(String),
                                'date': expect.any(String),
                                'target': 'variableKey',
                                'type': 'aggVariableDefaulted',
                                'featureVars': {},
                                'user_id': 'host.name',
                                'value': 1
                            }],
                            'user': {
                                'createdDate': expect.any(String),
                                'lastSeenDate': expect.any(String),
                                'platform': 'NodeJS',
                                'platformVersion': '16.0',
                                'sdkType': 'server',
                                'sdkVersion': '1.0.0',
                                'user_id': 'host.name'
                            }
                        }
                    ]
                }
            ]))
        })

        it('should generate multiple batches for chunkSize and handle onPayloadSuccess', () => {
            const envKey = 'env_key_flush_batch_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' }
            }

            initSDK(envKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 100; i++) {
                event.target = `target_${i}`
                queueEvent(envKey, dvcUser, event)
            }
            const payloads = flushEventQueue(envKey)
            expect(eventQueueSize(envKey)).toEqual(100)
            expect(payloads.length).toEqual(10)
            expect(payloads[0].records[0].events.length).toEqual(10)
            expect(payloads[0].records[0].user).toEqual({
                'createdDate': expect.any(String),
                'lastSeenDate': expect.any(String),
                'platform': 'NodeJS',
                'platformVersion': '16.0',
                'sdkType': 'server',
                'sdkVersion': '1.0.0',
                'user_id': 'user_id'
            })

            for (const payload of payloads) {
                onPayloadSuccess(envKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(envKey)
            expect(nextFlush).toEqual([])
        })

        it('should queue events from multiple users', () => {
            const envKey = 'env_key_flush_batch_users_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' }
            }
            const dvcUser2 = { user_id: 'user_2' }

            initSDK(envKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 26; i++) {
                event.target = `target_${i}`
                queueEvent(envKey, dvcUser, event)
                if (i < 14) {
                    event.target = `target_${i}`
                    queueEvent(envKey, dvcUser2, event)
                }
            }
            expect(eventQueueSize(envKey)).toEqual(40)

            const payloads = flushEventQueue(envKey)
            expect(payloads.length).toEqual(4)
            let user1Count = 0
            let user2Count = 0
            for (const payload of payloads) {
                for (const record of payload.records) {
                    if (record.user.user_id === dvcUser.user_id) {
                        user1Count++
                    } else if (record.user.user_id === dvcUser2.user_id) {
                        user2Count++
                    }
                }
            }
            expect(user1Count).toEqual(3)
            expect(user2Count).toEqual(2)
            expect(payloads[0].records.length).toEqual(1)
            expect(payloads[0].records[0].user.user_id).toEqual(dvcUser.user_id)
            expect(payloads[0].records[0].events.length).toEqual(10)

            expect(payloads[1].records.length).toEqual(1)
            expect(payloads[1].records[0].user.user_id).toEqual(dvcUser.user_id)
            expect(payloads[1].records[0].events.length).toEqual(10)

            expect(payloads[2].records.length).toEqual(2)
            expect(payloads[2].records[0].user.user_id).toEqual(dvcUser.user_id)
            expect(payloads[2].records[0].events.length).toEqual(6)
            expect(payloads[2].records[1].user.user_id).toEqual(dvcUser2.user_id)
            expect(payloads[2].records[1].events.length).toEqual(4)

            expect(payloads[3].records.length).toEqual(1)
            expect(payloads[3].records[0].user.user_id).toEqual(dvcUser2.user_id)
            expect(payloads[3].records[0].events.length).toEqual(10)

            for (const payload of payloads) {
                onPayloadSuccess(envKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(envKey)
            expect(nextFlush).toEqual([])
        })

        it('should requeue retryable failed payloads', () => {
            const envKey = 'env_key_flush_failed_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' }
            }

            initSDK(envKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 36; i++) {
                event.target = `target_${i}`
                queueEvent(envKey, dvcUser, event)
            }
            expect(eventQueueSize(envKey)).toEqual(36)

            const payloads = flushEventQueue(envKey)
            expect(payloads.length).toEqual(4)
            onPayloadSuccess(envKey, payloads[0].payloadId)
            onPayloadFailure(envKey, payloads[1].payloadId, true)
            onPayloadFailure(envKey, payloads[2].payloadId, false)
            onPayloadFailure(envKey, payloads[3].payloadId, true)
            expect(payloads[3].records[0].events.length).toEqual(6)

            for (let i = 0; i < 4; i++) {
                event.target = `target_after_failed_${i}`
                queueEvent(envKey, dvcUser, event)
            }
            expect(eventQueueSize(envKey)).toEqual(20)

            const failedPayloads = flushEventQueue(envKey)
            expect(failedPayloads.length).toEqual(3)
            expect(failedPayloads[0]).toEqual(payloads[1])
            expect(failedPayloads[1]).toEqual(payloads[3])
            expect(failedPayloads[2].records.length).toEqual(1)
            expect(failedPayloads[2].records[0].user.user_id).toEqual(dvcUser.user_id)
            expect(failedPayloads[2].records[0].events.length).toEqual(4)

            for (const payload of failedPayloads) {
                onPayloadSuccess(envKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(envKey)
            expect(nextFlush).toEqual([])
        })

        it('should throw error if all payloads have not finished sending', () => {
            const envKey = 'env_key_flush_not_finished_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' }
            }

            initSDK(envKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 36; i++) {
                event.target = `target_${i}`
                queueEvent(envKey, dvcUser, event)
            }
            expect(eventQueueSize(envKey)).toEqual(36)

            const payloads = flushEventQueue(envKey)
            expect(payloads.length).toEqual(4)
            onPayloadSuccess(envKey, payloads[0].payloadId)
            onPayloadFailure(envKey, payloads[1].payloadId, false)
            onPayloadFailure(envKey, payloads[2].payloadId, false)

            expect(() => flushEventQueue(envKey)).toThrow('has not finished sending')

            for (let i = 0; i < 10; i++) {
                event.target = `target_after_failed_${i}`
                queueEvent(envKey, dvcUser, event)
            }
            expect(eventQueueSize(envKey)).toEqual(16)
            onPayloadFailure(envKey, payloads[3].payloadId, true)

            const failedPayloads = flushEventQueue(envKey)
            expect(failedPayloads.length).toEqual(2)
            expect(failedPayloads[0].payloadId).toEqual(payloads[3].payloadId)

            for (const payload of failedPayloads) {
                onPayloadSuccess(envKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(envKey)
            expect(nextFlush).toEqual([])
        })
    })

    describe('queueEvent', () => {
        const dvcUser = { user_id: 'user_id' }
        const event = {
            type: 'testType',
            target: 'testTarget'
        }

        it('should throw error if SDK is not initialized', () => {
            const envKey = 'env_key_queueEvent_test'
            initEventQueue(envKey, {})
            expect(() => queueEvent(envKey, dvcUser, event)).toThrow('Platform data is not set')
        })

        it('should throw error if config data not set', () => {
            const envKey = 'env_key_queueEvent_test_2'
            initEventQueue(envKey, {})
            setPlatformData(JSON.stringify({
                platform: 'NodeJS',
                platformVersion: '16.0',
                sdkType: 'server',
                sdkVersion: '1.0.0'
            }))
            expect(() => queueEvent(envKey, dvcUser, event)).toThrow('Config data is not set.')
        })
    })

    describe('queueAggregateEvent', () => {
        const event = {
            type: 'aggVariableDefaulted',
            target: 'testTarget'
        }

        it('should throw error if no variableVariationMap', () => {
            const envKey = 'env_key_queueAggEvent_test'
            initEventQueue(envKey, {})
            expect(() => queueAggregateEvent(envKey, event, null))
                .toThrow('variableVariationMap is not a JSON Object')
        })

        it('should throw if no variable key value found for aggVariableEvaluated', () => {
            const envKey = 'env_key_agg_event_throw_test'
            const eventEvaluated = {
                type: 'aggVariableEvaluated',
                target: 'testTarget'
            }
            const variableVariationMap = {
                test: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d'
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d'
                }
            }

            initSDK(envKey)
            expect(() => queueAggregateEvent(envKey, eventEvaluated, variableVariationMap))
                .toThrow('Missing variableVariationMap mapping for target')
        })

        it('should throw if no target on event', () => {
            const envKey = 'env_key_agg_event_no_target_test'
            const eventEvaluated = { type: 'aggVariableEvaluated' }

            initSDK(envKey)
            expect(() => queueAggregateEvent(envKey, eventEvaluated, {}))
                .toThrow('Event missing target to save aggregate event')
        })

        it('should aggregate aggVariableDefaulted and aggVariableEvaluated events', () => {
            const envKey = 'env_key_agg_event_test'
            const eventDefaulted = {
                type: 'aggVariableDefaulted',
                target: 'testTarget'
            }
            const eventEvaluated = {
                type: 'aggVariableEvaluated',
                target: 'testTarget'
            }
            const variableVariationMap = {
                test: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d'
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d'
                }
            }

            initSDK(envKey)
            for (let i = 0; i < 36; i++) {
                eventDefaulted.target = 'testey_test'
                queueAggregateEvent(envKey, eventDefaulted, variableVariationMap)
            }
            for (let i = 0; i < 11; i++) {
                eventDefaulted.target = 'swageyTest'
                queueAggregateEvent(envKey, eventDefaulted, variableVariationMap)
            }
            for (let i = 0; i < 36; i++) {
                eventEvaluated.target = 'test'
                queueAggregateEvent(envKey, eventEvaluated, variableVariationMap)
            }
            for (let i = 0; i < 11; i++) {
                eventEvaluated.target = 'swagTest'
                queueAggregateEvent(envKey, eventEvaluated, variableVariationMap)
            }
            expect(eventQueueSize(envKey)).toEqual(4)

            const payloads = flushEventQueue(envKey)
            expect(payloads.length).toEqual(1)
            expect(payloads[0].records[0].events).toEqual([
                {
                    'clientDate': expect.any(String),
                    'date': expect.any(String),
                    'target': 'testey_test',
                    'type': 'aggVariableDefaulted',
                    'featureVars': {},
                    'user_id': 'host.name',
                    'value': 36
                }, {
                    'clientDate': expect.any(String),
                    'date': expect.any(String),
                    'target': 'swageyTest',
                    'type': 'aggVariableDefaulted',
                    'featureVars': {},
                    'user_id': 'host.name',
                    'value': 11
                }, {
                    'clientDate': expect.any(String),
                    'date': expect.any(String),
                    'target': 'test',
                    'type': 'aggVariableEvaluated',
                    'featureVars': {},
                    'user_id': 'host.name',
                    'value': 36,
                    'metaData': {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d'
                    }
                }, {
                    'clientDate': expect.any(String),
                    'date': expect.any(String),
                    'target': 'swagTest',
                    'type': 'aggVariableEvaluated',
                    'featureVars': {},
                    'user_id': 'host.name',
                    'value': 11,
                    'metaData': {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d'
                    }
                }
            ])
            expect(payloads[0].records[0].user.user_id).toEqual('host.name')
        })
    })
})

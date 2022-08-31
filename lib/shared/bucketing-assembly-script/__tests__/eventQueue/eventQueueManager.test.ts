import _ from 'lodash'
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
} from '../../build/bucketing-lib.debug'
import { FlushPayload } from '../../assembly/types'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData

const initEventQueue = (envKey: string, options: unknown) => {
    initEventQueue_AS(envKey, JSON.stringify(options))
}

const flushEventQueue = (envKey: string): FlushPayload[] => {
    const flushPayloadsStr = flushEventQueue_AS(envKey)
    return JSON.parse(flushPayloadsStr) as FlushPayload[]
}

const queueEvent = (envKey: string, user: unknown, event: unknown) => {
    queueEvent_AS(envKey, JSON.stringify(user), JSON.stringify(event))
}

const queueAggregateEvent = (envKey: string, user: unknown, event: unknown) => {
    queueAggregateEvent_AS(envKey, JSON.stringify(user), JSON.stringify(event))
}

const initSDK = (envKey: string, eventOptions: unknown = {}) => {
    initEventQueue(envKey, eventOptions)
    setPlatformData(JSON.stringify({
        platform: 'NodeJS',
        platformVersion: '16.0',
        sdkType: 'server',
        sdkVersion: '1.0.0'
    }))
    setConfigData(envKey, JSON.stringify(config))
}

describe('EventQueueManager Tests', () => {
    afterEach(() => clearPlatformData())

    describe('initEventQueue', () => {
        it('should init EventQueue without any options', () => {
            initEventQueue('env_key_test', {})
        })

        it('should throw error if no envKey', () => {
            // @ts-ignore
            expect(() => initEventQueue()).toThrow('value must not be null')
        })

        it('should throw error if no options', () => {
            // @ts-ignore
            expect(() => initEventQueue('env_key_test_2')).toThrow('value must not be null')
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
            queueAggregateEvent(envKey, dvcUser, aggEvent)
            expect(flushEventQueue(envKey)).toEqual(expect.arrayContaining([
                {
                    'payloadId': expect.any(String),
                    'records': [{
                        'events': [{
                            'clientDate': expect.any(Number),
                            'customType': 'testType',
                            'date': expect.any(Number),
                            'featureVars': {},
                            'metaData': { 'test': 'data', },
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
                    }]
                },
                {
                    'payloadId': expect.any(String),
                    'records': [{
                        'events': [{
                            'clientDate': expect.any(Number),
                            'customType': 'aggVariableDefaulted',
                            'date': expect.any(Number),
                            'target': 'variableKey',
                            'type': 'customEvent',
                            'user_id': 'aggregate',
                            'value': 1
                        }],
                        'user': {
                            'createdDate': expect.any(String),
                            'lastSeenDate': expect.any(String),
                            'platform': 'NodeJS',
                            'platformVersion': '16.0',
                            'sdkType': 'server',
                            'sdkVersion': '1.0.0',
                            'user_id': 'aggregate'
                        }
                    }]
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

            const payloads = flushEventQueue(envKey)
            expect(payloads.length).toEqual(5)
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
            expect(_.last(payloads)?.records[0].events.length).toEqual(4)
            expect(_.last(payloads)?.records[0].user.user_id).toEqual(dvcUser2.user_id)

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

            const payloads = flushEventQueue(envKey)
            expect(payloads.length).toEqual(4)
            onPayloadSuccess(envKey, payloads[0].payloadId)
            onPayloadFailure(envKey, payloads[1].payloadId, true)
            onPayloadFailure(envKey, payloads[2].payloadId, true)
            onPayloadFailure(envKey, payloads[3].payloadId, false)

            for (let i = 0; i < 10; i++) {
                event.target = `target_after_failed_${i}`
                queueEvent(envKey, dvcUser, event)
            }
            const failedPayloads = flushEventQueue(envKey)
            expect(failedPayloads.length).toEqual(3)
            expect(failedPayloads[0]).toEqual(payloads[1])
            expect(failedPayloads[1]).toEqual(payloads[2])

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
        const dvcUser = { user_id: 'user_id' }
        const event = {
            type: 'aggVariableDefaulted',
            target: 'testTarget'
        }

        it('should throw error if SDK is not initialized', () => {
            const envKey = 'env_key_queueAggEvent_test'
            initEventQueue(envKey, {})
            expect(() => queueAggregateEvent(envKey, dvcUser, event)).toThrow('Platform data is not set')
        })

        it('should throw error if config data not set', () => {
            const envKey = 'env_key_queueAggEvent_test_2'
            initEventQueue(envKey, {})
            setPlatformData(JSON.stringify({
                platform: 'NodeJS',
                platformVersion: '16.0',
                sdkType: 'server',
                sdkVersion: '1.0.0'
            }))
            expect(() => queueAggregateEvent(envKey, dvcUser, event)).toThrow('Config data is not set.')
        })

        it('should aggregate aggVariableDefaulted and aggVariableEvaluated events', () => {
            const envKey = 'env_key_agg_event_test'
            const user = {
                country: 'U S AND A',
                user_id: 'asuh',
                customData: {
                    favouriteFood: 'pizza'
                },
                privateCustomData: {
                    favouriteDrink: 'coffee',
                    favouriteNumber: 610,
                    favouriteBoolean: true
                },
                platformVersion: '1.1.2',
                os: 'Android',
                email: 'test@email.com'
            }
            const eventDefaulted = {
                type: 'aggVariableDefaulted',
                target: 'testTarget'
            }
            const eventEvaluated = {
                type: 'aggVariableEvaluated',
                target: 'testTarget'
            }

            initSDK(envKey)
            for (let i = 0; i < 36; i++) {
                eventDefaulted.target = 'testey_test'
                queueAggregateEvent(envKey, user, eventDefaulted)
            }
            for (let i = 0; i < 11; i++) {
                eventDefaulted.target = 'swageyTest'
                queueAggregateEvent(envKey, user, eventDefaulted)
            }
            for (let i = 0; i < 36; i++) {
                eventEvaluated.target = 'test'
                queueAggregateEvent(envKey, user, eventEvaluated)
            }
            for (let i = 0; i < 11; i++) {
                eventEvaluated.target = 'swagTest'
                queueAggregateEvent(envKey, user, eventEvaluated)
            }

            const payloads = flushEventQueue(envKey)
            expect(payloads.length).toEqual(1)
            expect(payloads[0].records[0].events).toEqual([
                {
                    'clientDate': expect.any(Number),
                    'customType': 'aggVariableDefaulted',
                    'date': expect.any(Number),
                    'target': 'testey_test',
                    'type': 'customEvent',
                    'user_id': 'aggregate',
                    'value': 36
                }, {
                    'clientDate': expect.any(Number),
                    'customType': 'aggVariableDefaulted',
                    'date': expect.any(Number),
                    'target': 'swageyTest',
                    'type': 'customEvent',
                    'user_id': 'aggregate',
                    'value': 11
                }, {
                    'clientDate': expect.any(Number),
                    'date': expect.any(Number),
                    'target': 'test',
                    'type': 'aggVariableEvaluated',
                    'user_id': 'aggregate',
                    'metaData': {
                        '614ef6aa473928459060721a.6153553b8cf4e45e0464268d': 36
                    }
                }, {
                    'clientDate': expect.any(Number),
                    'date': expect.any(Number),
                    'target': 'swagTest',
                    'type': 'aggVariableEvaluated',
                    'user_id': 'aggregate',
                    'metaData': {
                        '614ef6aa473928459060721a.6153553b8cf4e45e0464268d': 11
                    }
                }
            ])
            expect(payloads[0].records[0].user.user_id).toEqual('aggregate')
        })
    })
})

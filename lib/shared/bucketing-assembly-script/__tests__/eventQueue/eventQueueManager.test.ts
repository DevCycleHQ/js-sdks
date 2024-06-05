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
    eventQueueSize as eventQueueSize_AS,
    setClientCustomData,
    queueVariableEvaluatedEvent_JSON,
} from '../bucketingImportHelper'
import { FlushPayload } from '../../assembly/types'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData
import random_JSON from './random_json_2kb.json'

let currentSDKKey: string | null = null
const initEventQueue = (
    sdkKey: unknown,
    clientUUID: unknown,
    options: unknown,
) => {
    currentSDKKey = sdkKey as string
    initEventQueue_AS(
        sdkKey as string,
        clientUUID as string,
        JSON.stringify(options),
    )
}

const flushEventQueue = (sdkKey: string): FlushPayload[] => {
    const flushPayloadsStr = flushEventQueue_AS(sdkKey)
    return JSON.parse(flushPayloadsStr) as FlushPayload[]
}

const queueEvent = (sdkKey: string, user: unknown, event: unknown) => {
    return queueEvent_AS(sdkKey, JSON.stringify(user), JSON.stringify(event))
}

const queueAggregateEvent = (
    sdkKey: string,
    event: unknown,
    variableVariationMap: unknown,
) => {
    return queueAggregateEvent_AS(
        sdkKey,
        JSON.stringify(event),
        JSON.stringify(variableVariationMap),
    )
}

const queueVariableEvaluatedEvent = (
    sdkKey: string,
    config: unknown,
    variable: unknown,
    variableKey: string,
) => {
    return queueVariableEvaluatedEvent_JSON(
        sdkKey,
        JSON.stringify(config),
        variable ? JSON.stringify(variable) : null,
        variableKey,
    )
}

const eventQueueSize = (sdkKey: string): number => {
    return eventQueueSize_AS(sdkKey)
}

const initSDK = (
    sdkKey: string,
    eventOptions: unknown = {},
    clientUUID = 'uuid',
) => {
    initEventQueue(sdkKey, clientUUID, eventOptions)
    setPlatformData(
        JSON.stringify({
            platform: 'NodeJS',
            platformVersion: '16.0',
            sdkType: 'server',
            sdkVersion: '1.0.0',
            hostname: 'host.name',
        }),
    )
    setConfigData(sdkKey, JSON.stringify(config))
}

describe('EventQueueManager Tests', () => {
    afterEach(() => {
        clearPlatformData()
        if (currentSDKKey) {
            cleanupEventQueue(currentSDKKey)
            setClientCustomData(currentSDKKey, '{}')
            currentSDKKey = null
        }
    })

    describe('initEventQueue', () => {
        it('should init EventQueue without any options', () => {
            initEventQueue('sdk_key_test', 'uuid', {})
        })

        it('should throw error if no sdkKey', () => {
            expect(() =>
                initEventQueue(undefined, undefined, undefined),
            ).toThrow('value must not be null')
        })

        it('should throw error if no options', () => {
            expect(() =>
                initEventQueue('sdk_key_test_2', 'uuid_2', undefined),
            ).toThrow('value must not be null')
        })

        it('should throw if EnvQueue already setup for sdkKey', () => {
            initEventQueue('sdk_key_test_3', 'uuid_3', {})
            expect(() =>
                initEventQueue('sdk_key_test_3', 'uuid_3', {}),
            ).toThrow('Event Queue already exists for sdkKey')
        })

        it('should let you setup multiple EventQueues for multiple sdkKeys', () => {
            initEventQueue('sdk_key_test_4', 'uuid_4', {})
            initEventQueue('sdk_key_test_5', 'uuid_5', {})
            initEventQueue('sdk_key_test_6', 'uuid_6', {})
            initEventQueue('sdk_key_test_7', 'uuid_7', {})
        })

        it('should throw if eventRequestChunkSize is < 10', () => {
            expect(() =>
                initEventQueue('sdk_key_eventRequestChunkSize', 'uuid', {
                    eventRequestChunkSize: 9,
                }),
            ).toThrow('eventRequestChunkSize: 9 must be larger than 10')
        })

        it('should throw if eventRequestChunkSize is > 20,000', () => {
            expect(() =>
                initEventQueue('sdk_key_eventRequestChunkSize', 'uuid', {
                    eventRequestChunkSize: 900000,
                }),
            ).toThrow(
                'eventRequestChunkSize: 900000 must be smaller than 10000',
            )
        })
    })

    describe('flushEventQueue', () => {
        const dvcUser = {
            user_id: 'user_id',
            email: 'email@devcycle.com',
            language: 'en',
            country: 'us',
            appVersion: '6.1.0',
            appBuild: 188,
            deviceModel: 'dvcServer',
            customData: { custom: 'data' },
            privateCustomData: { private: 'customData' },
        }

        it('should flush queued events', () => {
            const sdkKey = 'sdk_key_flush_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' },
            }
            const aggEvent = {
                type: 'aggVariableDefaulted',
                target: 'variableKey',
            }

            initSDK(sdkKey)
            queueEvent(sdkKey, dvcUser, event)
            queueAggregateEvent(sdkKey, aggEvent, {})
            expect(eventQueueSize(sdkKey)).toEqual(2)
            expect(flushEventQueue(sdkKey)).toEqual(
                expect.arrayContaining([
                    {
                        payloadId: expect.any(String),
                        eventCount: 2,
                        records: [
                            {
                                events: [
                                    {
                                        clientDate: expect.any(String),
                                        customType: 'testType',
                                        date: expect.any(String),
                                        featureVars: {
                                            '614ef6aa473928459060721a':
                                                '6153553b8cf4e45e0464268d',
                                        },
                                        metaData: { test: 'data' },
                                        target: 'testTarget',
                                        type: 'customEvent',
                                        user_id: 'user_id',
                                        value: 10,
                                    },
                                ],
                                user: {
                                    createdDate: expect.any(String),
                                    lastSeenDate: expect.any(String),
                                    platform: 'NodeJS',
                                    platformVersion: '16.0',
                                    sdkType: 'server',
                                    sdkVersion: '1.0.0',
                                    user_id: 'user_id',
                                    email: 'email@devcycle.com',
                                    language: 'en',
                                    country: 'us',
                                    appVersion: '6.1.0',
                                    appBuild: 188,
                                    deviceModel: 'dvcServer',
                                    customData: { custom: 'data' },
                                    hostname: 'host.name',
                                },
                            },
                            {
                                events: [
                                    {
                                        clientDate: expect.any(String),
                                        date: expect.any(String),
                                        target: 'variableKey',
                                        type: 'aggVariableDefaulted',
                                        featureVars: {},
                                        user_id: 'uuid@host.name',
                                        value: 1,
                                    },
                                ],
                                user: {
                                    createdDate: expect.any(String),
                                    lastSeenDate: expect.any(String),
                                    platform: 'NodeJS',
                                    platformVersion: '16.0',
                                    sdkType: 'server',
                                    sdkVersion: '1.0.0',
                                    user_id: 'uuid@host.name',
                                    hostname: 'host.name',
                                },
                            },
                        ],
                    },
                ]),
            )
        })

        it('should merge client custom data into event user data', () => {
            const sdkKey = 'sdk_key_custom_data'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' },
            }

            initSDK(sdkKey)
            setClientCustomData(
                sdkKey,
                JSON.stringify({ clientCustom: 'data', private: 'field' }),
            )

            queueEvent(sdkKey, dvcUser, event)

            expect(flushEventQueue(sdkKey)).toEqual(
                expect.arrayContaining([
                    {
                        payloadId: expect.any(String),
                        eventCount: 1,
                        records: [
                            {
                                events: [
                                    {
                                        clientDate: expect.any(String),
                                        customType: 'testType',
                                        date: expect.any(String),
                                        featureVars: {
                                            '614ef6aa473928459060721a':
                                                '6153553b8cf4e45e0464268d',
                                        },
                                        metaData: { test: 'data' },
                                        target: 'testTarget',
                                        type: 'customEvent',
                                        user_id: 'user_id',
                                        value: 10,
                                    },
                                ],
                                user: {
                                    createdDate: expect.any(String),
                                    lastSeenDate: expect.any(String),
                                    platform: 'NodeJS',
                                    platformVersion: '16.0',
                                    sdkType: 'server',
                                    sdkVersion: '1.0.0',
                                    user_id: 'user_id',
                                    email: 'email@devcycle.com',
                                    language: 'en',
                                    country: 'us',
                                    appVersion: '6.1.0',
                                    appBuild: 188,
                                    deviceModel: 'dvcServer',
                                    customData: {
                                        custom: 'data',
                                        clientCustom: 'data',
                                    },
                                    hostname: 'host.name',
                                },
                            },
                        ],
                    },
                ]),
            )
        })

        it('should generate multiple batches for chunkSize and handle onPayloadSuccess', () => {
            const sdkKey = 'sdk_key_flush_batch_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' },
            }

            initSDK(sdkKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 100; i++) {
                event.target = `target_${i}`
                queueEvent(sdkKey, dvcUser, event)
            }
            const payloads = flushEventQueue(sdkKey)
            expect(eventQueueSize(sdkKey)).toEqual(100)
            expect(payloads.length).toEqual(10)
            expect(payloads[0].records[0].events.length).toEqual(10)
            expect(payloads[0].records[0].user).toEqual({
                createdDate: expect.any(String),
                lastSeenDate: expect.any(String),
                platform: 'NodeJS',
                platformVersion: '16.0',
                sdkType: 'server',
                sdkVersion: '1.0.0',
                user_id: 'user_id',
                email: 'email@devcycle.com',
                language: 'en',
                country: 'us',
                appVersion: '6.1.0',
                appBuild: 188,
                deviceModel: 'dvcServer',
                customData: { custom: 'data' },
                hostname: 'host.name',
            })
            expect(
                payloads[0].records[0].user.privateCustomData,
            ).not.toBeDefined()

            for (const payload of payloads) {
                onPayloadSuccess(sdkKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(sdkKey)
            expect(nextFlush).toEqual([])
        })

        it('should queue events from multiple users', () => {
            const sdkKey = 'sdk_key_flush_batch_users_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' },
            }
            const dvcUser2 = { user_id: 'user_2' }

            initSDK(sdkKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 26; i++) {
                event.target = `target_${i}`
                queueEvent(sdkKey, dvcUser, event)
                if (i < 14) {
                    event.target = `target_${i}`
                    queueEvent(sdkKey, dvcUser2, event)
                }
            }
            expect(eventQueueSize(sdkKey)).toEqual(40)

            const payloads = flushEventQueue(sdkKey)
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
            expect(payloads[2].records[1].user.user_id).toEqual(
                dvcUser2.user_id,
            )
            expect(payloads[2].records[1].events.length).toEqual(4)

            expect(payloads[3].records.length).toEqual(1)
            expect(payloads[3].records[0].user.user_id).toEqual(
                dvcUser2.user_id,
            )
            expect(payloads[3].records[0].events.length).toEqual(10)

            for (const payload of payloads) {
                onPayloadSuccess(sdkKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(sdkKey)
            expect(nextFlush).toEqual([])
        })

        it('should requeue retryable failed payloads', () => {
            const sdkKey = 'sdk_key_flush_failed_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' },
            }

            initSDK(sdkKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 36; i++) {
                event.target = `target_${i}`
                queueEvent(sdkKey, dvcUser, event)
            }
            expect(eventQueueSize(sdkKey)).toEqual(36)

            const payloads = flushEventQueue(sdkKey)
            expect(payloads.length).toEqual(4)
            onPayloadSuccess(sdkKey, payloads[0].payloadId)
            onPayloadFailure(sdkKey, payloads[1].payloadId, true)
            onPayloadFailure(sdkKey, payloads[2].payloadId, false)
            onPayloadFailure(sdkKey, payloads[3].payloadId, true)
            expect(payloads[3].records[0].events.length).toEqual(6)

            for (let i = 0; i < 4; i++) {
                event.target = `target_after_failed_${i}`
                queueEvent(sdkKey, dvcUser, event)
            }
            expect(eventQueueSize(sdkKey)).toEqual(20)

            const failedPayloads = flushEventQueue(sdkKey)
            expect(failedPayloads.length).toEqual(3)
            expect(failedPayloads[0]).toEqual(payloads[1])
            expect(failedPayloads[1]).toEqual(payloads[3])
            expect(failedPayloads[2].records.length).toEqual(1)
            expect(failedPayloads[2].records[0].user.user_id).toEqual(
                dvcUser.user_id,
            )
            expect(failedPayloads[2].records[0].events.length).toEqual(4)

            for (const payload of failedPayloads) {
                onPayloadSuccess(sdkKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(sdkKey)
            expect(nextFlush).toEqual([])
        })

        it("should throw error if re-queued payload hasn't finished sending", () => {
            const sdkKey = 'sdk_key_requeued_failed_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' },
            }

            initSDK(sdkKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 36; i++) {
                event.target = `target_${i}`
                queueEvent(sdkKey, dvcUser, event)
            }

            const payloads = flushEventQueue(sdkKey)
            onPayloadSuccess(sdkKey, payloads[0].payloadId)
            onPayloadFailure(sdkKey, payloads[1].payloadId, true)
            onPayloadFailure(sdkKey, payloads[2].payloadId, false)
            onPayloadFailure(sdkKey, payloads[3].payloadId, true)

            for (let i = 0; i < 4; i++) {
                event.target = `target_after_failed_${i}`
                queueEvent(sdkKey, dvcUser, event)
            }

            const failedPayloads = flushEventQueue(sdkKey)
            // failedPayloads[0] has not finished
            onPayloadSuccess(sdkKey, failedPayloads[1].payloadId)
            onPayloadSuccess(sdkKey, failedPayloads[2].payloadId)

            expect(() => flushEventQueue(sdkKey)).toThrow(
                'has not finished sending',
            )
        })

        it('should throw error if all payloads have not finished sending', () => {
            const sdkKey = 'sdk_key_flush_not_finished_test'
            const event = {
                type: 'testType',
                target: 'testTarget',
                value: 10,
                metaData: { test: 'data' },
            }

            initSDK(sdkKey, { eventRequestChunkSize: 10 })
            for (let i = 0; i < 36; i++) {
                event.target = `target_${i}`
                queueEvent(sdkKey, dvcUser, event)
            }
            expect(eventQueueSize(sdkKey)).toEqual(36)

            const payloads = flushEventQueue(sdkKey)
            expect(payloads.length).toEqual(4)
            onPayloadSuccess(sdkKey, payloads[0].payloadId)
            onPayloadFailure(sdkKey, payloads[1].payloadId, false)
            onPayloadFailure(sdkKey, payloads[2].payloadId, false)

            expect(() => flushEventQueue(sdkKey)).toThrow(
                'has not finished sending',
            )

            for (let i = 0; i < 10; i++) {
                event.target = `target_after_failed_${i}`
                queueEvent(sdkKey, dvcUser, event)
            }
            expect(eventQueueSize(sdkKey)).toEqual(16)
            onPayloadFailure(sdkKey, payloads[3].payloadId, true)

            const failedPayloads = flushEventQueue(sdkKey)
            expect(failedPayloads.length).toEqual(2)
            expect(failedPayloads[0].payloadId).toEqual(payloads[3].payloadId)

            for (const payload of failedPayloads) {
                onPayloadSuccess(sdkKey, payload.payloadId)
            }
            const nextFlush = flushEventQueue(sdkKey)
            expect(nextFlush).toEqual([])
        })
    })

    describe('queueEvent', () => {
        const dvcUser = { user_id: 'user_id' }
        const event = {
            type: 'testType',
            target: 'testTarget',
        }

        it('should throw error if SDK is not initialized', () => {
            const sdkKey = 'sdk_key_queueEvent_test'
            initEventQueue(sdkKey, 'uuid', {})
            expect(() => queueEvent(sdkKey, dvcUser, event)).toThrow(
                'Platform data is not set',
            )
        })

        it('should throw error if config data not set', () => {
            const sdkKey = 'sdk_key_queueEvent_test_2'
            initEventQueue(sdkKey, 'uuid', {})
            setPlatformData(
                JSON.stringify({
                    platform: 'NodeJS',
                    platformVersion: '16.0',
                    sdkType: 'server',
                    sdkVersion: '1.0.0',
                }),
            )
            expect(() => queueEvent(sdkKey, dvcUser, event)).toThrow(
                'Config data is not set.',
            )
        })

        it('should log sdkConfig as non-custom event', () => {
            const sdkKey = 'sdk_key_queueEvent_test_2'
            initSDK(sdkKey)

            const sdkConfigEvent = {
                type: 'sdkConfig',
                target: 'url',
                value: 610,
                metaData: {
                    clientUUID: 'uuid',
                    reqEtag: 'reqEtag',
                    reqLastModified: 'reqLastModified',
                    resEtag: 'resEtag',
                    resLastModified: 'resLastModified',
                    resRayId: 'resRayId',
                    resStatus: 200,
                    errMsg: 'errMsg',
                },
            }
            queueEvent(sdkKey, dvcUser, sdkConfigEvent)

            const payloads = flushEventQueue(sdkKey)
            expect(payloads.length).toEqual(1)
            expect(payloads[0].records[0]).toEqual({
                events: [
                    {
                        clientDate: expect.any(String),
                        date: expect.any(String),
                        featureVars: {
                            '614ef6aa473928459060721a':
                                '6153553b8cf4e45e0464268d',
                        },
                        metaData: {
                            clientUUID: 'uuid',
                            errMsg: 'errMsg',
                            reqEtag: 'reqEtag',
                            reqLastModified: 'reqLastModified',
                            resEtag: 'resEtag',
                            resLastModified: 'resLastModified',
                            resRayId: 'resRayId',
                            resStatus: 200,
                        },
                        target: 'url',
                        type: 'sdkConfig',
                        user_id: 'user_id',
                        value: 610,
                    },
                ],
                user: {
                    createdDate: expect.any(String),
                    lastSeenDate: expect.any(String),
                    hostname: 'host.name',
                    platform: 'NodeJS',
                    platformVersion: '16.0',
                    sdkType: 'server',
                    sdkVersion: '1.0.0',
                    user_id: 'user_id',
                },
            })
        })
    })

    describe('queueVariableEvaluatedEvent', () => {
        const varVariationMap = {
            swagTest: {
                _feature: '614ef6aa473928459060721a',
                _variation: '615357cf7e9ebdca58446ed0',
            },
        }

        it('should log aggVariableEvaluated event', () => {
            const variable = {
                _id: '615356f120ed334a6054564c',
                key: 'swagTest',
                type: 'String',
                value: 'YEEEEOWZA',
            }
            const sdkKey = 'sdk_key_queueVariableEvaluatedEvent_test'
            initSDK(sdkKey)

            queueVariableEvaluatedEvent(
                sdkKey,
                varVariationMap,
                variable,
                'swagTest',
            )
            expect(eventQueueSize(sdkKey)).toEqual(1)
        })

        it('should log aggVariableDefaulted event', () => {
            const sdkKey = 'sdk_key_queueVariableEvaluatedEvent_test'
            initSDK(sdkKey)

            queueVariableEvaluatedEvent(
                sdkKey,
                varVariationMap,
                null,
                'unknownVariable',
            )
            expect(eventQueueSize(sdkKey)).toEqual(1)
        })
    })

    describe('queueAggregateEvent', () => {
        const event = {
            type: 'aggVariableDefaulted',
            target: 'testTarget',
        }

        it('should throw error if no variableVariationMap', () => {
            const sdkKey = 'sdk_key_queueAggEvent_test'
            initEventQueue(sdkKey, 'uuid', {})
            expect(() => queueAggregateEvent(sdkKey, event, null)).toThrow(
                'variableVariationMap is not a JSON Object',
            )
        })

        it('should throw if no variable key value found for aggVariableEvaluated', () => {
            const sdkKey = 'sdk_key_agg_event_throw_test'
            const eventEvaluated = {
                type: 'aggVariableEvaluated',
                target: 'testTarget',
            }
            const variableVariationMap = {
                test: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
            }

            initSDK(sdkKey)
            expect(() =>
                queueAggregateEvent(
                    sdkKey,
                    eventEvaluated,
                    variableVariationMap,
                ),
            ).toThrow('Missing variableVariationMap mapping for target')
        })

        it('should throw if no target on event', () => {
            const sdkKey = 'sdk_key_agg_event_no_target_test'
            const eventEvaluated = { type: 'aggVariableEvaluated' }

            initSDK(sdkKey)
            expect(() =>
                queueAggregateEvent(sdkKey, eventEvaluated, {}),
            ).toThrow('Event missing target to save aggregate event')
        })

        it('should aggregate aggVariableDefaulted and aggVariableEvaluated events', () => {
            const sdkKey = 'sdk_key_agg_event_test'
            const eventDefaulted = {
                type: 'aggVariableDefaulted',
                target: 'testTarget',
            }
            const eventEvaluated = {
                type: 'aggVariableEvaluated',
                target: 'testTarget',
            }
            const variableVariationMap = {
                test: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
                swagTest: {
                    _feature: '614ef6aa473928459060721a',
                    _variation: '6153553b8cf4e45e0464268d',
                },
            }

            initSDK(sdkKey)
            for (let i = 0; i < 36; i++) {
                eventDefaulted.target = 'testey_test'
                queueAggregateEvent(
                    sdkKey,
                    eventDefaulted,
                    variableVariationMap,
                )
            }
            for (let i = 0; i < 11; i++) {
                eventDefaulted.target = 'swageyTest'
                queueAggregateEvent(
                    sdkKey,
                    eventDefaulted,
                    variableVariationMap,
                )
            }
            for (let i = 0; i < 36; i++) {
                eventEvaluated.target = 'test'
                queueAggregateEvent(
                    sdkKey,
                    eventEvaluated,
                    variableVariationMap,
                )
            }
            for (let i = 0; i < 11; i++) {
                eventEvaluated.target = 'swagTest'
                queueAggregateEvent(
                    sdkKey,
                    eventEvaluated,
                    variableVariationMap,
                )
            }
            expect(eventQueueSize(sdkKey)).toEqual(4)

            const payloads = flushEventQueue(sdkKey)
            expect(payloads.length).toEqual(1)
            expect(payloads[0].records[0].events).toEqual([
                {
                    clientDate: expect.any(String),
                    date: expect.any(String),
                    target: 'testey_test',
                    type: 'aggVariableDefaulted',
                    featureVars: {},
                    user_id: 'uuid@host.name',
                    value: 36,
                },
                {
                    clientDate: expect.any(String),
                    date: expect.any(String),
                    target: 'swageyTest',
                    type: 'aggVariableDefaulted',
                    featureVars: {},
                    user_id: 'uuid@host.name',
                    value: 11,
                },
                {
                    clientDate: expect.any(String),
                    date: expect.any(String),
                    target: 'test',
                    type: 'aggVariableEvaluated',
                    featureVars: {},
                    user_id: 'uuid@host.name',
                    value: 36,
                    metaData: {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                    },
                },
                {
                    clientDate: expect.any(String),
                    date: expect.any(String),
                    target: 'swagTest',
                    type: 'aggVariableEvaluated',
                    featureVars: {},
                    user_id: 'uuid@host.name',
                    value: 11,
                    metaData: {
                        _feature: '614ef6aa473928459060721a',
                        _variation: '6153553b8cf4e45e0464268d',
                    },
                },
            ])
            expect(payloads[0].records[0].user.user_id).toEqual(
                'uuid@host.name',
            )
        })
    })

    describe('memory usage test', () => {
        it('should save a large number of events to AS Event Queue', () => {
            const sdkKey = 'sdk_key_memory_test'
            const user_id = 'user_id_long_name_test_long_name_test_long_name_test_long_name_test_long_name_test'
            const event = {
                type: 'testType_long_name_test_long_name_test_long_name_test_long_name_test_long_name_test_long_name',
                target: 'testTarget_long_name_test_long_name_test_long_name_test_long_name_test_long_name_test',
                date: new Date(),
                value: 10000,
                metaData: random_JSON,
            }
            const dvcUser = {
                user_id,
                email: '_long_name_test_long_name_test_long_name_test_long_name_test_long_name_test_long_name_test',
                language: 'en',
                country: 'CA',
                appBuild: 1000000,
                appVersion: '1000000.1000000.10099999',
                deviceModel:
                    'deviceModel_long_name_test_long_name_test_long_name_test_long_name_test_long_name_test',
                customData: random_JSON,
                privateCustomData: random_JSON,
            }

            initSDK(sdkKey)
            for (let i = 0; i < 2000; i++) {
                event.target += i
                dvcUser.user_id = user_id + i
                queueEvent(sdkKey, dvcUser, event)
            }

            const payloads = flushEventQueue(sdkKey)
            expect(eventQueueSize(sdkKey)).toEqual(2000)
            expect(payloads.length).toEqual(20)
        })
    })
})

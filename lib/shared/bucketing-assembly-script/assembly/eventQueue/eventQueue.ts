import {
    DVCEvent,
    DVCPopulatedUser,
    EventQueueOptions,
    DVCRequestEvent,
    UserEventsBatchRecord,
    FeatureVariation
} from '../types'
import { DVCPopulatedUserPB } from '../types/dvcUserPB'

export type VariationAggMap = Map<string, i64>
export type FeatureAggMap = Map<string, VariationAggMap>
export type VariableAggMap = Map<string, FeatureAggMap>
export type AggEventQueue = Map<string, VariableAggMap>
export type UserEventQueue = Map<string, UserEventsBatchRecord>

export class FlushEventQueues {
    public userEventQueue: UserEventQueue
    public aggEventQueue: AggEventQueue
}

const EventTypesSet = new Set<string>()
EventTypesSet.add('variableEvaluated')
EventTypesSet.add('aggVariableEvaluated')
EventTypesSet.add('variableDefaulted')
EventTypesSet.add('aggVariableDefaulted')

export class EventQueue {
    private sdkKey: string
    options: EventQueueOptions

    /**
     * Map<user_id, UserEventsBatchRecord>
     */
    private userEventQueue: UserEventQueue

    /**
     * Map<'aggVariableDefaulted',
     *      Map<variable.key,
     *          Map<'value',
     *              Map<'value', counter>
     *          >
     *      >
     * >
     *
     * Map<'aggVariableEvaluated',
     *      Map<variable.key,
     *          Map<feature._id,
     *              Map<variation_id, counter>
     *          >
     *      >
     * >
     */
    private aggEventQueue: AggEventQueue

    public eventQueueCount: i32

    constructor(sdkKey: string, options: EventQueueOptions) {
        this.sdkKey = sdkKey
        this.options = options
        this.userEventQueue = new Map<string, UserEventsBatchRecord>()
        this.aggEventQueue = new Map<string, VariableAggMap>()
        this.eventQueueCount = 0
    }

    flushAndResetEventQueue(): FlushEventQueues {
        const userEventQueue = this.userEventQueue
        const aggEventQueue = this.aggEventQueue
        this.userEventQueue = new Map<string, UserEventsBatchRecord>()
        this.aggEventQueue = new Map<string, VariableAggMap>()
        this.eventQueueCount = 0
        return { userEventQueue, aggEventQueue }
    }

    checkIfEventLoggingDisabled(event: DVCEvent): bool {
        if (!EventTypesSet.has(event.type)) {
            return this.options.disableCustomEventLogging
        } else {
            return this.options.disableAutomaticEventLogging
        }
    }

    queueEvent(user: DVCPopulatedUser, event: DVCEvent, featureVariationMap: Map<string, string>): void {
        if (this.checkIfEventLoggingDisabled(event)) {
            return
        }

        const requestEvent = new DVCRequestEvent(event, user.user_id, featureVariationMap)
        const user_id = user.user_id
        let userEvents: UserEventsBatchRecord
        if (!this.userEventQueue.has(user_id)) {
            userEvents = new UserEventsBatchRecord(user, [])
            this.userEventQueue.set(user_id, userEvents)
        } else {
            userEvents = this.userEventQueue.get(user_id)
            userEvents.user = user
        }

        userEvents.events.push(requestEvent)
        this.eventQueueCount++
    }

    queueAggregateEvent(
        event: DVCEvent,
        variableVariationMap: Map<string, FeatureVariation>,
        aggByVariation: boolean
    ): void {
        if (this.checkIfEventLoggingDisabled(event)) {
            return
        }

        const type = event.type
        const target = event.target
        if (!target) {
            throw new Error('Event missing target to save aggregate event')
        }

        let variableFeatureVarAggMap: VariableAggMap
        if (this.aggEventQueue.has(type)) {
            variableFeatureVarAggMap = this.aggEventQueue.get(type)
        } else {
            variableFeatureVarAggMap = new Map<string, FeatureAggMap>()
            this.aggEventQueue.set(type, variableFeatureVarAggMap)
        }

        let featureVarAggMap: FeatureAggMap
        if (variableFeatureVarAggMap.has(target)) {
            featureVarAggMap = variableFeatureVarAggMap.get(target)
        } else {
            featureVarAggMap = new Map<string, VariationAggMap>()
            variableFeatureVarAggMap.set(target, featureVarAggMap)
        }

        if (aggByVariation) {
            if (!variableVariationMap.has(target)) {
                throw new Error(`Missing variableVariationMap mapping for target: ${target} to aggregate by variation`)
            }
            const featureVariation: FeatureVariation = variableVariationMap.get(target)

            let variationAggMap: VariationAggMap
            if (featureVarAggMap.has(featureVariation._feature)) {
                variationAggMap = featureVarAggMap.get(featureVariation._feature)
            } else {
                variationAggMap = new Map<string, i64>()
                featureVarAggMap.set(featureVariation._feature, variationAggMap)
            }

            if (variationAggMap.has(featureVariation._variation)) {
                const variationCount: i64 = variationAggMap.get(featureVariation._variation)
                variationAggMap.set(featureVariation._variation, variationCount + 1)
            } else {
                variationAggMap.set(featureVariation._variation, 1)
                this.eventQueueCount++
            }
        } else {
            /**
             * Because `aggEventQueue` is now aggregated by both feature and variation,
             * we need to set an empty map here to fit the same schema for tracking `aggVariableDefaulted` events.
             */
            if (featureVarAggMap.has('value')) {
                const variationAggMap: VariationAggMap = featureVarAggMap.get('value')
                if (variationAggMap.has('value')) {
                    const count: i64 = variationAggMap.get('value')
                    variationAggMap.set('value', count + 1)
                } else {
                    throw new Error('Missing second value map for aggVariableDefaulted')
                }
            } else {
                const variationAggMap = new Map<string, i64>()
                variationAggMap.set('value', 1)
                featureVarAggMap.set('value', variationAggMap)
                this.eventQueueCount++
            }
        }
    }
}

import { DevCycleEvent } from './types'
import { checkParamDefined } from './utils'
import { EventTypes } from './EventQueue'
import { DVCPopulatedUser } from './User'
import type { BucketedUserConfig, SDKEventRequestBody } from '@devcycle/types'

export function generateEventPayload(
    config: BucketedUserConfig | undefined,
    user: DVCPopulatedUser,
    events: DevCycleEvent[],
): SDKEventRequestBody {
    return {
        events: events.map((event) => {
            return new DVCRequestEvent(event, user.user_id, config)
        }),
        user,
    }
}
export class DVCRequestEvent implements DevCycleEvent {
    type: string
    target?: string
    customType?: string
    user_id: string
    clientDate: number
    value?: number
    featureVars?: Record<string, string>
    metaData?: Record<string, unknown>

    constructor(
        event: DevCycleEvent,
        user_id: string,
        config: BucketedUserConfig | undefined,
    ) {
        const { type, target, date, value, metaData } = event
        checkParamDefined('type', type)
        const isCustomEvent = !(type in EventTypes)
        this.type = isCustomEvent ? 'customEvent' : type
        this.customType = isCustomEvent ? type : undefined
        this.target = target
        this.user_id = user_id
        this.clientDate = date || Date.now()
        this.value = value

        if (
            config &&
            config.settings?.filterFeatureVars &&
            (type === 'variableEvaluated' || type === 'variableDefaulted') &&
            target
        ) {
            const variable = config?.variables[target]
            const featureId = variable?.featureId
            this.featureVars =
                featureId && config?.featureVariationMap[featureId]
                    ? {
                          [featureId]: config?.featureVariationMap[featureId],
                      }
                    : {}
        } else {
            this.featureVars = config?.featureVariationMap || {}
        }
        this.metaData = metaData
    }
}

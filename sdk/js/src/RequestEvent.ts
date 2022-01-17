import { DVCEvent } from 'dvc-js-client-sdk'
import { checkParamDefined } from './utils'
import { EventTypes } from './EventQueue'
import { DVCUser } from 'dvc-js-client-sdk'

export type DVCEventPayload = {
    events: DVCRequestEvent[],
    user: DVCUser
}

export class DVCRequestEvent {
    type: string
    target?: string
    customType?: string
    user_id: string
    clientDate: number
    value?: number
    featureVars?: Record<string, string>
    metaData?: Record<string, unknown>

    constructor(event: DVCEvent, user_id: string, featureVars?: Record<string, string>) {
        const { type, target, date, value, metaData } = event
        checkParamDefined('type', type)
        const isCustomEvent = !EventTypes[type]
        this.type = isCustomEvent ? 'customEvent' : type
        this.customType = isCustomEvent ? type : undefined
        this.target = target
        this.user_id = user_id
        this.clientDate = date || Date.now()
        this.value = value
        this.featureVars = featureVars
        this.metaData = metaData
    }
}

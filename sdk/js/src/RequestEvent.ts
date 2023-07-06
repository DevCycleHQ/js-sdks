import { DevCycleClientEvent } from './types'
import { checkParamDefined } from './utils'
import { EventTypes } from './EventQueue'

export class DVCRequestEvent implements DevCycleClientEvent {
    type: string
    target?: string
    customType?: string
    user_id: string
    clientDate: number
    value?: number
    featureVars?: Record<string, string>
    metaData?: Record<string, unknown>

    constructor(
        event: DevCycleClientEvent,
        user_id: string,
        featureVars?: Record<string, string>,
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
        this.featureVars = featureVars || {}
        this.metaData = metaData
    }
}

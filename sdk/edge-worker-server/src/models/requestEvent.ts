// import { EventTypes } from '../eventQueue'
import {
    DevCycleEvent,
    checkParamDefined,
    checkParamString,
} from '@devcycle/js-cloud-server-sdk'

export class DVCRequestEvent {
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
        featureVars?: Record<string, string>,
    ) {
        const { type, target, date, value, metaData } = event
        checkParamDefined('type', type)
        checkParamString('type', type)
        checkParamDefined('user_id', user_id)
        checkParamString('user_id', user_id)

        const isCustomEvent = true //!EventTypes[type]
        this.type = isCustomEvent ? 'customEvent' : type
        this.target = target
        this.customType = isCustomEvent ? type : undefined
        this.user_id = user_id
        this.clientDate = date || Date.now()
        this.value = value
        this.featureVars = featureVars
        this.metaData = metaData
    }
}

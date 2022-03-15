import { DVCEvent } from '../types'
import { checkParamDefined, checkParamString } from '../utils/paramUtils'

export const EventTypes: Record<string, string> = {
    variableEvaluated: 'variableEvaluated',
    variableDefaulted: 'variableDefaulted',
}

export class DVCRequestEvent {
    type: string
    target?: string
    customType?: string
    user_id: string
    date: number
    clientDate: number
    value?: number
    featureVars?: Record<string, string>
    metaData?: Record<string, unknown>

    constructor(event: DVCEvent, user_id: string, featureVars?: Record<string, string>) {
        const { type, target, date, value, metaData } = event
        checkParamDefined('type', type)
        checkParamString('type', type)
        checkParamDefined('user_id', user_id)
        checkParamString('user_id', user_id)

        const isCustomEvent = !EventTypes[type]
        this.type = isCustomEvent ? 'customEvent' : type
        this.target = target
        this.customType = isCustomEvent ? type : undefined
        this.user_id = user_id
        this.date = Date.now()
        this.clientDate = date || Date.now()
        this.value = value
        this.featureVars = featureVars
        this.metaData = metaData
    }
}

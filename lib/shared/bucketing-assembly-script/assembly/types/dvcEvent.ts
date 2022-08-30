import { JSON } from 'assemblyscript-json/assembly'
import {
    getDateFromJSONOptional,
    getF64FromJSONOptional,
    getJSONObjFromJSONOptional,
    getStringFromJSON,
    getStringFromJSONOptional, jsonArrFromValueArray, jsonObjFromMap
} from '../helpers/jsonHelpers'
import { DVCPopulatedUser } from './dvcUser'
import uuid from 'as-uuid/assembly'

interface DVCUserInterface {
    type: string
    date: Date | null
    target: string | null
    value: f64
    metaData: JSON.Obj | null
}

export const EventTypes = new Set<string>()
EventTypes.add('variableEvaluated')
EventTypes.add('aggVariableEvaluated')
EventTypes.add('variableDefaulted')
EventTypes.add('aggVariableEvaluated')

export class DVCEvent extends JSON.Value implements DVCUserInterface {
    constructor(
        /**
         * type of the event
         */
        public type: string,

        /**
         * target / subject of event. Contextual to event type
         */
        public target: string | null,

        /**
         * date event occurred according to client stored as time since epoch
         */
        public date: Date | null,

        /**
         * value for numerical events. Contextual to event type
         */
        public value: f64,

        /**
         * extra metadata for event. Contextual to event type
         */
        public metaData: JSON.Obj | null
    ) {
        super()
    }

    static fromJSONString(eventStr: string): DVCEvent {
        const eventJSON = JSON.parse(eventStr)
        if (!eventJSON.isObj) throw new Error('DVCEvent eventStr not a JSON Object')
        const event = eventJSON as JSON.Obj

        return new DVCEvent(
            getStringFromJSON(event, 'type'),
            getStringFromJSONOptional(event, 'target'),
            getDateFromJSONOptional(event, 'date'),
            getF64FromJSONOptional(event, 'value', NaN),
            getJSONObjFromJSONOptional(event, 'metaData')
        )
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('type', this.type)
        const date = this.date // nullable check only works like this
        if (date) json.set('date', date.toISOString())
        if (this.target) json.set('target', this.target)
        if (!isNaN(this.value)) json.set('value', this.value)
        if (this.metaData) json.set('metaData', this.metaData)
        return json.stringify()
    }
}

export class DVCRequestEvent extends JSON.Value {
    /**
     * type of the event
     */
    type: string

    /**
     * target / subject of event. Contextual to event type
     */
    target: string | null

    customType: string | null

    user_id: string

    /**
     * date event occurred according to client stored as time since epoch
     */
    date: i64

    clientDate: i64

    /**
     * value for numerical events. Contextual to event type
     */
    value: f64

    featureVars: Map<string, string> | null

    /**
     * extra metadata for event. Contextual to event type
     */
    metaData: JSON.Obj | null

    constructor(event: DVCEvent, user_id: string, featureVars: Map<string, string> | null) {
        super()

        const isCustomEvent = !EventTypes.has(event.type)

        this.type = isCustomEvent ? 'customEvent' : event.type
        this.target = event.target
        this.customType = isCustomEvent ? event.type : null
        this.user_id = user_id
        this.date = Date.now()
        const eventDate = event.date ? event.date : null
        this.clientDate = eventDate ? eventDate.getTime() : Date.now()
        this.value = event.value
        this.featureVars = featureVars
        this.metaData = event.metaData
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('type', this.type)
        if (this.target) json.set('target', this.target)
        if (this.customType) json.set('customType', this.customType)
        json.set('user_id', this.user_id)
        json.set('date', this.date)
        json.set('clientDate', this.clientDate)
        if (!isNaN(this.value)) json.set('value', this.value)
        const featureVars = this.featureVars // nullable check only works like this
        if (featureVars) json.set('featureVars', jsonObjFromMap(featureVars))
        if (this.metaData) json.set('metaData', this.metaData)
        return json.stringify()
    }
}

export class UserEventsBatchRecord extends JSON.Value {
    constructor(
        public user: DVCPopulatedUser,
        public events: DVCRequestEvent[]
    ) {
        super()
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('user', this.user)
        json.set('events', jsonArrFromValueArray(this.events))
        return json.stringify()
    }
}

export class FlushPayload extends JSON.Value {
    // TODO: implement
    public payloadId: string
    public status: string

    constructor(
        public records: UserEventsBatchRecord[]
    ) {
        super()
        this.status = 'sending'
        this.payloadId = uuid()
    }

    stringify(): string {
        const jsonObj = new JSON.Obj()
        jsonObj.set('records', jsonArrFromValueArray(this.records))
        jsonObj.set('payloadId', this.payloadId)
        return jsonObj.stringify()
    }
}

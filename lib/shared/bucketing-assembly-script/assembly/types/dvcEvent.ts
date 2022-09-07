import { JSON } from 'assemblyscript-json/assembly'
import {
    getDateFromJSONOptional,
    getF64FromJSONOptional,
    getJSONObjFromJSONOptional,
    getStringFromJSON,
    getStringFromJSONOptional,
    getStringMapFromJSONObj,
    jsonArrFromValueArray,
    jsonObjFromMap
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
EventTypes.add('aggVariableDefaulted')

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
    date: Date

    clientDate: Date

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
        this.date = new Date(Date.now())
        const eventDate = event.date ? event.date : null
        this.clientDate = eventDate ? eventDate: new Date(Date.now())
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
        json.set('date', this.date.toISOString())
        json.set('clientDate', this.clientDate.toISOString())
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
    public payloadId: string
    public status: string

    constructor(
        public records: UserEventsBatchRecord[]
    ) {
        super()
        this.status = 'sending'
        this.payloadId = uuid()
    }

    /**
     * Add batchRecord for user, first check if there is an existing record for the user,
     * otherwise create a new record with a max `chunkSize` number of events.
     */
    addBatchRecordForUser(record: UserEventsBatchRecord, chunkSize: i32): void {
        const userRecord = this.recordForUser(record.user.user_id)
        const splicedEvents = record.events.splice(0, chunkSize - this.eventCount())
        if (splicedEvents.length === 0) return

        if (userRecord) {
            userRecord.user = record.user
            userRecord.events = userRecord.events.concat(splicedEvents)
        } else {
            const newBatchRecord = new UserEventsBatchRecord(
                record.user,
                splicedEvents
            )
            this.records.push(newBatchRecord)
        }
    }

    /**
     * Fetch an existing UserEventsBatchRecord for a `user_id`
     */
    recordForUser(user_id: string): UserEventsBatchRecord | null {
        for (let i = 0; i < this.records.length; i++) {
            const record = this.records[i]
            if (record.user.user_id === user_id) {
                return record
            }
        }
        return null
    }

    /**
     * Fetch the total event count for all the records in the batch
     */
    eventCount(): i32 {
        let count: i32 = 0
        for (let i = 0; i < this.records.length; i++) {
            const record = this.records[i]
            count += record.events.length
        }
        return count
    }

    stringify(): string {
        const jsonObj = new JSON.Obj()
        jsonObj.set('records', jsonArrFromValueArray(this.records))
        jsonObj.set('payloadId', this.payloadId)
        jsonObj.set('eventCount', this.eventCount())
        return jsonObj.stringify()
    }
}

export function testDVCEventClass(eventStr: string): string {
    const event = DVCEvent.fromJSONString(eventStr)
    return event.stringify()
}

export function testDVCRequestEventClass(eventStr: string, user_id: string, featureVarsStr: string): string {
    const featureVarsJSON = JSON.parse(featureVarsStr)
    if (!featureVarsJSON.isObj) throw new Error('featureVarsJSON is not a JSON Object')

    const requestEvent = new DVCRequestEvent(
        DVCEvent.fromJSONString(eventStr),
        user_id,
        getStringMapFromJSONObj(featureVarsJSON as JSON.Obj)
    )
    return requestEvent.stringify()
}

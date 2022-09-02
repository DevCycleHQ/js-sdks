import { JSON } from 'assemblyscript-json/assembly'
import {
    getF64FromJSONValue,
    getI32FromJSONValue
} from '../helpers/jsonHelpers'

export class EventQueueOptions extends JSON.Obj {
    flushEventsMS: f64 = 10 * 1000
    disableAutomaticEventLogging: bool = false
    disableCustomEventLogging: bool = false
    eventRequestChunkSize: i32 = 100

    constructor(str: string) {
        super()
        const json = JSON.parse(str)
        if (!json.isObj) throw new Error('EventQueueOptions not a JSON Object')
        const jsonObj = json as JSON.Obj

        const flushEventsMSValue = jsonObj.get('flushEventsMS')
        if (flushEventsMSValue) {
            this.flushEventsMS = getF64FromJSONValue(flushEventsMSValue)
        }

        const disableAutomaticEventLogging = jsonObj.getBool('disableAutomaticEventLogging')
        if (disableAutomaticEventLogging) {
            this.disableAutomaticEventLogging = disableAutomaticEventLogging.valueOf()
        }

        const disableCustomEventLogging = jsonObj.getBool('disableCustomEventLogging')
        if (disableCustomEventLogging) {
            this.disableCustomEventLogging = disableCustomEventLogging.valueOf()
        }

        const chunkSizeValue = jsonObj.get('eventRequestChunkSize')
        if (chunkSizeValue) {
            this.eventRequestChunkSize = getI32FromJSONValue(chunkSizeValue)
        }
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('flushEventsMS', this.flushEventsMS)
        json.set('disableAutomaticEventLogging', this.disableAutomaticEventLogging)
        json.set('disableCustomEventLogging', this.disableCustomEventLogging)
        json.set('eventRequestChunkSize', this.eventRequestChunkSize)
        return json.stringify()
    }
}

export function testEventQueueOptionsClass(optionsStr: string): string {
    const options = new EventQueueOptions(optionsStr)
    return options.stringify()
}

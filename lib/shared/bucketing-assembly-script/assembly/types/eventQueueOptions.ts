import { JSON } from 'assemblyscript-json/assembly'
import { getI32FromJSONValue } from '../helpers/jsonHelpers'

export class EventQueueOptions extends JSON.Obj {
    eventRequestChunkSize: i32 = 100
    disableAutomaticEventLogging: bool = false
    disableCustomEventLogging: bool = false

    constructor(str: string) {
        super()
        const json = JSON.parse(str)
        if (!json.isObj) throw new Error('EventQueueOptions not a JSON Object')
        const jsonObj = json as JSON.Obj

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
        if (this.eventRequestChunkSize < 10) {
            throw new Error(`eventRequestChunkSize: ${this.eventRequestChunkSize} must be larger than 10`)
        } else if (this.eventRequestChunkSize > 10000) {
            throw new Error(`eventRequestChunkSize: ${this.eventRequestChunkSize} must be smaller than 10000`)
        }
    }

    stringify(): string {
        const json = new JSON.Obj()
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

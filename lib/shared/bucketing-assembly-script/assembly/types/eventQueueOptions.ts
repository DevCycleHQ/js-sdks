import { JSON } from 'assemblyscript-json/assembly'
import { getF64FromJSONOptional } from '../helpers/jsonHelpers'

export class EventQueueOptions extends JSON.Obj {
    flushEventsMS: f64
    disableAutomaticEventLogging: bool = false
    disableCustomEventLogging: bool = false
    chunkSize: i32 = 100

    constructor(str: string) {
        super()
        const json = JSON.parse(str)
        if (!json.isObj) throw new Error('EventQueueOptions not a JSON Object')
        const jsonObj = json as JSON.Obj

        this.flushEventsMS = getF64FromJSONOptional(jsonObj, 'flushEventsMS', 10 * 1000)

        const disableAutomaticEventLogging = jsonObj.getBool('disableAutomaticEventLogging')
        if (disableAutomaticEventLogging) {
            this.disableAutomaticEventLogging = disableAutomaticEventLogging.valueOf()
        }

        const disableCustomEventLogging = jsonObj.getBool('disableCustomEventLogging')
        if (disableCustomEventLogging) {
            this.disableCustomEventLogging = disableCustomEventLogging.valueOf()
        }

        const chunkSize = jsonObj.getInteger('eventRequestChunkSize')
        if (chunkSize) {
            this.chunkSize = i32(chunkSize.valueOf())
        }
    }
}

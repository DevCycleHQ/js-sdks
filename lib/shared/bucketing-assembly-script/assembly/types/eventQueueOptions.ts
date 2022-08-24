import { JSON } from 'assemblyscript-json/assembly'
import { getF64FromJSONOptional } from '../helpers/jsonHelpers'

export class EventQueueOptions extends JSON.Obj {
    flushEventsMS: f64
    disableAutomaticEventLogging: bool
    disableCustomEventLogging: bool

    constructor(str: string) {
        super()
        const json = JSON.parse(str)
        if (!json.isObj) throw new Error('EventQueueOptions not a JSON Object')
        const jsonObj = json as JSON.Obj

        this.flushEventsMS = getF64FromJSONOptional(jsonObj, 'flushEventsMS', 10 * 1000)

        const disableAutomaticEventLogging = jsonObj.getBool('disableAutomaticEventLogging')
        this.disableAutomaticEventLogging = disableAutomaticEventLogging
            ? disableAutomaticEventLogging.valueOf()
            : false

        const disableCustomEventLogging = jsonObj.getBool('disableCustomEventLogging')
        this.disableCustomEventLogging = disableCustomEventLogging
            ? disableCustomEventLogging.valueOf()
            : false
    }
}

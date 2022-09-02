import { testEventQueueOptionsClass } from '../../build/bucketing-lib.debug'

const testEventQueueOptions = (optionsObj: unknown): unknown => {
    return JSON.parse(testEventQueueOptionsClass(JSON.stringify(optionsObj)))
}

describe('eventQueueOptions Tests', () => {
    it('should test eventQueueOptions JSON parsing', () => {
        const options = {
            flushEventsMS: 60 * 1000,
            disableAutomaticEventLogging: true,
            disableCustomEventLogging: false,
            eventRequestChunkSize: 10000
        }
        expect(testEventQueueOptions(options)).toEqual(options)
    })

    it('should set default values', () => {
        expect(testEventQueueOptions({})).toEqual({
            flushEventsMS: 10 * 1000,
            disableAutomaticEventLogging: false,
            disableCustomEventLogging: false,
            eventRequestChunkSize: 100
        })
    })
})

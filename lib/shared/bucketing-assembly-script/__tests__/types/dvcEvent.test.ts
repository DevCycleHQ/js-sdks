import {
    testDVCEventClass,
    testDVCRequestEventClass
} from '../../build/bucketing-lib.debug'

const testDVCEvent = (event: unknown): unknown => {
    return JSON.parse(testDVCEventClass(JSON.stringify(event)))
}

const testDVCRequestEvent = (event: unknown, user_id: unknown, featureVars: unknown): unknown => {
    return JSON.parse(testDVCRequestEventClass(
        JSON.stringify(event),
        user_id as string,
        JSON.stringify(featureVars)
    ))
}

describe('DVCEvent tests', () => {
    describe('DVCEvent', () => {
        it('should test DVCEvent json parsing', () => {
            const eventObj = {
                type: 'type',
                target: 'target',
                date: new Date(),
                value: 610000,
                metaData: { meta: 'data', num: 610, bool: true }
            }
            expect(testDVCEvent(eventObj)).toEqual(expect.objectContaining({
                ...eventObj,
                date: eventObj.date.toISOString()
            }))
        })

        it('should test DVCEvent with no optional values', () => {
            const eventObj = { type: 'type' }
            expect(testDVCEvent(eventObj)).toEqual(eventObj)
        })
    })

    describe('DVCRequestEvent', () => {
        it('should test DVCRequestEvent JSON parsing', () => {
            const eventObj = {
                type: 'type',
                target: 'target',
                date: new Date(),
                value: 610000,
                metaData: { meta: 'data', num: 610, bool: true }
            }
            const user_id = 'user_id'
            const featureVars = { feature: 'vars' }

            expect(testDVCRequestEvent(eventObj, user_id, featureVars)).toEqual(expect.objectContaining({
                ...eventObj,
                user_id,
                type: 'customEvent',
                customType: eventObj.type,
                date: expect.any(Number),
                clientDate: eventObj.date.getTime(),
                featureVars
            }))
        })

        it('should test DVCRequestEvent with no optional values', () => {
            const eventObj = { type: 'type' }
            const user_id = 'user_id'
            const featureVars = {}
            expect(testDVCRequestEvent(eventObj, user_id, featureVars)).toEqual(expect.objectContaining({
                user_id,
                type: 'customEvent',
                customType: eventObj.type,
                featureVars
            }))
        })
    })
})

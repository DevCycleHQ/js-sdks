import { DVCRequestEvent, EventTypes } from '../../src/models/requestEvent'

describe('DVCRequestEvent Unit Tests', () => {
    it('should construct custom DVCRequestEvent from DVCEvent', () => {
        const date = Date.now()
        const requestEvent = new DVCRequestEvent({
            type: 'type',
            date,
            target: 'target',
            value: 610,
            metaData: { meta: 'data' }
        }, 'user_id', { 'feature': 'vars' })

        expect(requestEvent).toEqual(expect.objectContaining({
            type: 'customEvent',
            customType: 'type',
            user_id: 'user_id',
            date: expect.any(Number),
            clientDate: date,
            target: 'target',
            value: 610,
            featureVars: { 'feature': 'vars' },
            metaData: { meta: 'data' }
        }))
    })

    it('should construct an event for an internal DVC Event', () => {
        const requestEvent = new DVCRequestEvent({
            type: EventTypes.variableEvaluated
        }, 'user_id')
        expect(requestEvent).toEqual(expect.objectContaining({
            type: EventTypes.variableEvaluated,
            user_id: 'user_id',
            date: expect.any(Number),
            clientDate: expect.any(Number)
        }))
    })

    it('should check that type is defined as a string', () => {
        expect(() => new (DVCRequestEvent as any)({})).toThrow('Missing parameter: type')
        expect(() => new (DVCRequestEvent as any)({ type: 6 })).toThrow('type is not of type: string')
    })

    it('should check that user_id is defined as a string', () => {
        expect(() => new (DVCRequestEvent as any)({ type: 'type' })).toThrow('Missing parameter: user_id')
        expect(() => new (DVCRequestEvent as any)({ type: 'type' }, 6)).toThrow('user_id is not of type: string')
    })
})

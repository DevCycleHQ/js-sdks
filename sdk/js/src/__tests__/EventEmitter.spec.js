import { EventEmitter } from '../EventEmitter'

describe('EventEmitter tests', () => {
    const eventEmitter = new EventEmitter()

    beforeEach(() => {
        eventEmitter.events = {}
    })

    it('should throw if key type is not a string', () => {
        expect(() => eventEmitter.subscribe()).toThrow(expect.any(Error))
        expect(() => eventEmitter.subscribe(true)).toThrow(expect.any(Error))
        expect(() => eventEmitter.unsubscribe()).toThrow(expect.any(Error))
        expect(() => eventEmitter.unsubscribe(true)).toThrow(expect.any(Error))
        expect(() => eventEmitter.emit()).toThrow(expect.any(Error))
        expect(() => eventEmitter.emit(true)).toThrow(expect.any(Error))
    })

    describe('subscribe', () => {
        it('should throw error if event is not a predefined event', () => {
            const handler = jest.fn()
            expect(() => eventEmitter.subscribe('not_an_event', handler)).toThrow(expect.any(Error))
        })

        it('should subscribe to event', () => {
            const handler = jest.fn()
            eventEmitter.subscribe('initialized', handler)
            expect(eventEmitter.events['initialized'][0]).toEqual(handler)
        })

        it('should subscribe with more than one event', () => {
            const handler1 = jest.fn()
            const handler2 = jest.fn()
            eventEmitter.subscribe('initialized', handler1)
            eventEmitter.subscribe('initialized', handler2)
            expect(eventEmitter.events['initialized'][0]).toEqual(handler1)
            expect(eventEmitter.events['initialized'][1]).toEqual(handler2)
        })
    })

    describe('unsubscribe', () => {
        it('should unsubscribe to event', () => {
            const handler = jest.fn()
            eventEmitter.subscribe('initialized', handler)
            eventEmitter.unsubscribe('initialized', handler)
            expect(eventEmitter.events['initialized'].length).toBe(0)
        })

        it('should subscribe with more than one event', () => {
            const handler1 = jest.fn()
            const handler2 = jest.fn()
            eventEmitter.subscribe('initialized', handler1)
            eventEmitter.unsubscribe('initialized', handler1)
            eventEmitter.subscribe('initialized', handler2)
            eventEmitter.unsubscribe('initialized', handler2)
            expect(eventEmitter.events['initialized'].length).toBe(0)
        })
    })

    describe('emit', () => {
        it('should emit events and handler should callback', () => {
            const handler = jest.fn()
            eventEmitter.subscribe('initialized', handler)
            eventEmitter.emit('initialized', false)
            expect(handler).toBeCalledWith(false)
        })
    })
})
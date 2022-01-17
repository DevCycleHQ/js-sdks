import { checkParamType } from "./utils"

const EventNames = {
    INITIALIZED: 'initialized',
    ERROR: 'error'
}

type eventHandler = (...args: any[]) => void

export class EventEmitter {
    events: Record<string, eventHandler[]>

    constructor() {
        this.events = {}
    }

    subscribe(key: string, handler: eventHandler) {
        checkParamType('key', key, 'string')
        checkParamType('handler', handler, 'function')
        
        const eventNames = Object.keys(EventNames).map(e => e.toLowerCase())
        if (!eventNames.includes(key)) {
            throw new Error('Not a valid event to subscribe to')
        } else if (!this.events[key]) {
            this.events[key] = [ handler ]
        } else {
            this.events[key].push(handler)
        }
    }

    unsubscribe(key: string, handler?: eventHandler) {
        checkParamType('key', key, 'string')
        
        const eventNames = Object.keys(EventNames).map(e => e.toLowerCase())
        if (!eventNames.includes(key)) {
            return
        } else if (!handler) {
            this.events[key] = []
        } else {
            this.events[key] = this.events[key].filter(eventHandler => eventHandler !== handler)
        }
    }

    emit(key: string, ...args: any[]) {
        checkParamType('key', key, 'string')
        
        const handlers = this.events[key]
        if (!handlers) {
            this.events[key] = []
            return
        }

        handlers.forEach((handler) => {
            handler(...args)
        })
    }

    emitInitialized(success: boolean) {
        this.emit(EventNames.INITIALIZED, success)
    }

    emitError(error: Error) {
        this.emit(EventNames.ERROR, error)
    }
}
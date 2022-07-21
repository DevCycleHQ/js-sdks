export const EventNames = {
    CONFIG_UPDATED: 'configUpdated'
}

type eventHandler = (...args: any[]) => void

export class EventEmitter {
    events: Record<string, eventHandler[]>

    constructor() {
        this.events = {}
    }

    subscribe(key: string, handler: eventHandler): void {
        const eventNames = Object.keys(EventNames).map((e) => e.toLowerCase())
        if (!eventNames.includes(key) &&
            !key.startsWith(EventNames.CONFIG_UPDATED)) {
            throw new Error('Not a valid event to subscribe to')
        } else if (!this.events[key]) {
            this.events[key] = [ handler ]
        } else {
            this.events[key].push(handler)
        }
    }

    unsubscribe(key: string, handler?: eventHandler): void {
        const eventNames = Object.keys(EventNames).map((e) => e.toLowerCase())
        if (!eventNames.includes(key)) {
            return
        } else if (!handler) {
            this.events[key] = []
        } else {
            this.events[key] = this.events[key].filter((eventHandler) => eventHandler !== handler)
        }
    }

    emit(key: string, ...args: any[]): void {
        const handlers = this.events[key]
        if (!handlers) {
            this.events[key] = []
            return
        }

        handlers.forEach((handler) => {
            handler(...args)
        })
    }
}

export interface DevCycleEvent {
    /**
     * type of the event
     */
    type: string

    /**
     * date event occurred according to client stored as time since epoch
     */
    date?: number

    /**
     * target / subject of event. Contextual to event type
     */
    target?: string

    /**
     * value for numerical events. Contextual to event type
     */
    value?: number

    /**
     * extra metadata for event. Contextual to event type
     */
    metaData?: Record<string, unknown>
}

import { IsNotEmpty, IsNumber, IsOptional, IsString, IsObject } from 'class-validator'

/**
 * Public API Event type used in CF Workers / SDKs to define the public interface to an event.
 * All DVCEvents will be be saved as type = 'customEvent' events, where customType = DVCEvent.type,
 * and clientDate = DVCEvent.date.
 */
export class DVCEvent {
    /**
     * type of the event
     */
    @IsNotEmpty()
    @IsString()
        type: string

    /**
     * target / subject of event. Contextual to event type
     */
    @IsOptional()
    @IsString()
        target?: string

    /**
     * date the event occurred according to client
     */
    @IsOptional()
    @IsNumber()
        date?: number

    /**
     * value for numerical events. Contextual to event type
     */
    @IsOptional()
    @IsNumber()
        value?: number

    /**
     * extra metadata for event. Contextual to event type
     */
    @IsOptional()
    @IsObject()
        metaData?: Record<string, unknown>
}

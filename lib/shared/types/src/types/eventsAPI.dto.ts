import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { DVCAPIUser } from './clientSDKAPI'
import 'reflect-metadata'

/**
 * API Populated Event type used in CF Workers / SDKs with all populated event data from the config data
 * ready to be sent to the Events API.
 */
export class DVCPopulatedRequestEventDto {
    /**
     * type of the event
     */
    @IsString()
        type: string

    /**
     * target / subject of event. Contextual to event type
     */
    @IsOptional()
    @IsString()
        target?: string

    /**
     * type of custom event when type == 'customEvent'
     */
    @IsOptional()
    @IsString()
        customType?: string

    /**
     * custom user id of user that triggered event
     */
    @IsString()
    @IsNotEmpty()
        user_id: string

    /**
     * date event occurred according to server
     */
    @IsNumber()
        date: number

    /**
     * date event occurred according to client
     */
    @IsNumber()
        clientDate: number

    /**
     * value for numerical events. Contextual to event type
     */
    @IsOptional()
    @IsNumber()
        value?: number

    /**
     * map of feature ids to variation ids
     */
    @IsNotEmpty()
        featureVars: Record<string, string>

    /**
     * extra metadata for event. Contextual to event type
     */
    @IsOptional()
        metaData?: Record<string, unknown>
}

export type DVCSubmitRequestEvents = {
    events: DVCPopulatedRequestEventDto[]

    user: DVCAPIUser
}

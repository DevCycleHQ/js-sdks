import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { DVCAPIUser } from '../sdk/clientSDKAPI'
import 'reflect-metadata'

/**
 * API Populated Event type used in CF Workers / SDKs with all populated event data from the config data
 * ready to be sent to the Events API.
 */
export class DVCPopulatedRequestEventDto {
    /**
   * type of the event
   */
    type: string

    /**
   * target / subject of event. Contextual to event type
   */
    target?: string

    /**
   * type of custom event when type == 'customEvent'
   */
    customType?: string

    /**
   * custom user id of user that triggered event
   */
    user_id: string

    /**
   * date event occurred according to server
   */
    date: number

    /**
   * date event occurred according to client
   */
    clientDate: number

    /**
   * value for numerical events. Contextual to event type
   */
    value?: number

    /**
   * map of feature ids to variation ids
   */
    featureVars: Record<string, string>

    /**
   * extra metadata for event. Contextual to event type
   */
    metaData?: Record<string, unknown>
}

export type DVCSubmitRequestEvents = {
  events: DVCPopulatedRequestEventDto[];

  user: DVCAPIUser;
};

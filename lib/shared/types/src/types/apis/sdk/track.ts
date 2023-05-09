import { DVCAPIUser } from "./clientSDKAPI";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Public API Event type used in CF Workers / SDKs to define the public interface to an event.
 * All DVCEvents will be be saved as type = 'customEvent' events, where customType = DVCEvent.type,
 * and clientDate = DVCEvent.date.
 */
export class DVCEvent {
  /**
   * type of the event
   */
  type: string;

  /**
   * target / subject of event. Contextual to event type
   */
  target?: string;

  /**
   * date the event occurred according to client
   */
  date?: number;

  /**
   * value for numerical events. Contextual to event type
   */
  value?: number;

  /**
   * extra metadata for event. Contextual to event type
   */
  metaData?: Record<string, unknown>;
}

export class SDKEventRequestBody {
  user: DVCAPIUser;

  events: DVCEvent[];
}

export type SDKEventBatchRequestBody = SDKEventRequestBody[];

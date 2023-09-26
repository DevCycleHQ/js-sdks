import { getWithTimeout, post } from '@devcycle/server-request'
import { DVCLogger, SDKEventBatchRequestBody } from '@devcycle/types'

export const HOST = '.devcycle.com'
export const EVENT_URL = 'https://events'
export const EVENTS_PATH = '/v1/events/batch'

export async function publishEvents(
    logger: DVCLogger,
    sdkKey: string,
    eventsBatch: SDKEventBatchRequestBody,
    eventsBaseURLOverride?: string,
): Promise<Response> {
    const url = eventsBaseURLOverride
        ? `${eventsBaseURLOverride}${EVENTS_PATH}`
        : `${EVENT_URL}${HOST}${EVENTS_PATH}`
    return await post(
        url,
        {
            body: JSON.stringify({ batch: eventsBatch }),
        },
        sdkKey,
    )
}

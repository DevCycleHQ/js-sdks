import { DVCPopulatedUser } from '@devcycle/js-cloud-server-sdk'
import {
    DevCycleEvent,
    DVCRequestEvent,
    publishEvents,
} from '@devcycle/server-request'
import { BucketedUserConfig, DVCLogger, SDKEventBatchRequestBody } from '@devcycle/types'

export function generateAggEvent(
    user_id: string,
    type: string,
    variableKey: string,
    variableVariationMap: BucketedUserConfig['variableVariationMap'],
): DVCRequestEvent[] {
    return new DVCRequestEvent({
        type,
        target: variableKey,
        value: 1,
        metaData: variableVariationMap[variableKey]
    }, user_id)
}

export async function publishDevCycleEvents(
    logger: DVCLogger,
    sdkKey: string,
    user: DVCPopulatedUser,
    events: DevCycleEvent[],
    featureVars: Record<string, string>,
): Promise<void> {
    const requestEvents = events.map((event) => {
        return new DVCRequestEvent(event, user.user_id, featureVars)
    })
    const requestBody: SDKEventBatchRequestBody = [
        {
            user,
            events: requestEvents,
        },
    ]
    try {
        const res = await publishEvents(logger, sdkKey, requestBody)
        if (res.status !== 201) {
            this.logger.error(
                `Error publishing events, status: ${
                    res.status
                }, body: ${await res.text()}`,
            )
        } else {
            this.logger.debug(
                `DevCycle Flushed ${requestEvents.length} Events`,
            )
        }
    }
}

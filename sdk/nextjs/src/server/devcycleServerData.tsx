import { getBucketedConfig } from './bucketing'
import { getOptions, getSDKKey, getTrackedEvents } from './requestContext'
import { DevCycleEvent } from '@devcycle/js-client-sdk'

export const getDevCycleServerData = async (): Promise<{
    config: Awaited<ReturnType<typeof getBucketedConfig>>
    sdkKey: string
    events: ReturnType<typeof getTrackedEvents>
    options: ReturnType<typeof getOptions>
}> => {
    const config = await getBucketedConfig()
    return {
        config,
        sdkKey: getSDKKey(),
        events: getTrackedEvents(),
        options: getOptions(),
    }
}

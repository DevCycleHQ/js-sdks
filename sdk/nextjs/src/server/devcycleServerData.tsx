import { getBucketedConfig } from './bucketing'
import { getOptions, getSDKKey, getTrackedEvents } from './requestContext'

export const getDevCycleServerData = async () => {
    const { config, user, populatedUser } = await getBucketedConfig()
    return {
        user,
        populatedUser,
        config,
        sdkKey: getSDKKey(),
        events: getTrackedEvents(),
        options: getOptions(),
    }
}

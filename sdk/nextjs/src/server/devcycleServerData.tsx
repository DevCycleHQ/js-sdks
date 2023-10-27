import { getBucketedConfig } from './bucketing'
import { getSDKKey, getTrackedEvents } from './requestContext'

export const getDevCycleServerData = async () => {
    const { config, user, populatedUser } = await getBucketedConfig()
    return {
        user,
        populatedUser,
        config,
        sdkKey: getSDKKey(),
        events: getTrackedEvents(),
    }
}

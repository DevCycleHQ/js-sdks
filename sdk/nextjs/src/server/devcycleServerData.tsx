import { getBucketedConfig } from './bucketing'
import { getSDKKey } from './requestContext'
import { headers } from 'next/headers'

export const getDevCycleServerData = async () => {
    const { config, user, populatedUser } = await getBucketedConfig()
    return {
        user,
        populatedUser,
        config,
        sdkKey: getSDKKey(),
        userAgent: headers().get('user-agent'),
    }
}

import { getBucketedConfig } from './bucketing'
import { getSDKKey } from './context'
import { headers } from 'next/headers'

export const getDevCycleContext = async () => {
    const { config, user, populatedUser } = await getBucketedConfig()
    return {
        user,
        populatedUser,
        config,
        sdkKey: getSDKKey(),
        userAgent: headers().get('user-agent'),
    }
}

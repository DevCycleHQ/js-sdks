import { getBucketedConfig } from './bucketing'
import { getIdentity, getSDKKey } from './context'

export const getDevCycleContext = async () => {
    const config = await getBucketedConfig()
    return {
        user: getIdentity(),
        config,
        sdkKey: getSDKKey(),
    }
}

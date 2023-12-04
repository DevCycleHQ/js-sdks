import { getBucketedConfig } from './bucketing'
import { getOptions, getSDKKey, getTrackedEvents } from './requestContext'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getUserIdentity } from './identify'

export const getDevCycleServerData = async (): Promise<{
    config: Awaited<ReturnType<typeof getBucketedConfig>>
    sdkKey: string
    events: ReturnType<typeof getTrackedEvents>
    options: ReturnType<typeof getOptions>
    user: DevCycleUser
}> => {
    const config = await getBucketedConfig()
    const user = getUserIdentity()
    if (!user) {
        throw Error('User should be defined')
    }
    return {
        config,
        user,
        sdkKey: getSDKKey(),
        events: getTrackedEvents(),
        options: getOptions(),
    }
}

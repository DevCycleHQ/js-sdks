import { getBucketedConfig } from './bucketing'
import { getOptions, getSDKKey } from './requestContext'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getUserIdentity } from './identify'

export const getDevCycleServerData = async (): Promise<{
    config: Awaited<ReturnType<typeof getBucketedConfig>> | null
    sdkKey: string
    options: ReturnType<typeof getOptions>
    user: DevCycleUser
}> => {
    let config = null
    try {
        config = await getBucketedConfig()
    } catch (e) {
        console.error('Error fetching DevCycle config', e)
    }
    const user = getUserIdentity()
    if (!user) {
        throw Error('User should be defined')
    }
    return {
        config,
        user,
        sdkKey: getSDKKey(),
        options: getOptions(),
    }
}

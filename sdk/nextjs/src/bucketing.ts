import { fetchCDNConfig } from './requests'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { getIdentity } from './context'
import { DVCBucketingUser } from '@devcycle/types'

// wrap this function in react cache to avoid redoing work for the same user and config
const generateBucketedConfigCached = async (
    user: DVCBucketingUser,
    configResponse: Response,
) => {
    const config = await configResponse.json()
    return generateBucketedConfig({ user, config })
}

export const getBucketedConfig = async () => {
    // this request will be cached by Next
    const cdnConfig = await fetchCDNConfig()
    const user = getIdentity()
    if (!user) {
        throw Error('User must be set in cookie')
    }
    return generateBucketedConfigCached(user as DVCBucketingUser, cdnConfig)
}

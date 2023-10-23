import 'server-only'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getBucketedConfig } from './bucketing'
import { getClient, setIdentity } from './context'
import { getDVCCookie } from './cookie'

/**
 * Identify user on the serverside. Overrides any incoming user context from the clientside cookie.
 * @param user
 */
export const identifyUser = async (user: DevCycleUser) => {
    setIdentity(user)
    const { populatedUser } = await getBucketedConfig()
    let client = getClient()
    if (client) {
        client.user = populatedUser
    }
}

/**
 * identify the user if we don't already have one in the incoming cookie
 * @param user
 */
export const identifyInitialUser = async (user: DevCycleUser) => {
    const dvcCookie = getDVCCookie()
    if (!dvcCookie) {
        setIdentity(user)
    } else {
        console.log('SETTING IDENTITY')
        setIdentity(dvcCookie.user)
    }
    const { populatedUser } = await getBucketedConfig()
    let client = getClient()
    if (client) {
        client.user = populatedUser
    }
}

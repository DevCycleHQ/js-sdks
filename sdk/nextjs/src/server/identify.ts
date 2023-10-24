import 'server-only'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getBucketedConfig } from './bucketing'
import { getClient, getIdentity, setIdentity } from './requestContext'
import { getDVCCookie } from './cookie'

/**
 * Identify user on the serverside. Overrides any incoming user context from the clientside cookie.
 * @param user
 */
export const identifyUser = async (user: DevCycleUser) => {
    setIdentity(user)
    await _fetchConfigForUser()
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
    await _fetchConfigForUser()
}

const _fetchConfigForUser = async () => {
    const { populatedUser } = await getBucketedConfig()
    let client = getClient()
    if (client) {
        client.user = populatedUser
    }
}

export const getUserIdentity = () => getIdentity()

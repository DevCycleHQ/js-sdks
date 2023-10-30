import 'server-only'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getBucketedConfig } from './bucketing'
import { getClient, getIdentity, setIdentity } from './requestContext'
import { getDVCCookie } from './cookie'

/**
 * Identify user on the serverside. Overrides any incoming user context from the clientside cookie.
 * @param user
 */
export const identifyUser = (user: DevCycleUser): void => {
    setIdentity(user)
}

/**
 * identify the user if we don't already have one in the incoming cookie
 * @param user
 */
export const identifyInitialUser = (user: DevCycleUser): void => {
    const dvcCookie = getDVCCookie()
    if (!dvcCookie) {
        setIdentity(user)
    } else {
        setIdentity(dvcCookie.user)
    }
}

export const getUserIdentity = (): ReturnType<typeof getIdentity> =>
    getIdentity()

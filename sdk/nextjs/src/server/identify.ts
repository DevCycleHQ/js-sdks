import 'server-only'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getIdentity, setIdentity } from './requestContext'

/**
 * Identify user on the serverside.
 * @param user
 */
export const identifyUser = (user: DevCycleUser): void => {
    setIdentity(user)
}

export const getUserIdentity = (): ReturnType<typeof getIdentity> =>
    getIdentity()

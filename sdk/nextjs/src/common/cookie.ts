import { DevCycleUser } from '@devcycle/js-client-sdk'

export type DVCCookie = {
    user: DevCycleUser
    timestamp: string
    forceRefresh: boolean
}

export const createCookieContents = (
    user: DevCycleUser,
    configTimestamp?: string,
    forceRefresh: boolean = false,
) => {
    return JSON.stringify({ user, timestamp: configTimestamp, forceRefresh })
}
export const cookieName = 'devcycle-next'

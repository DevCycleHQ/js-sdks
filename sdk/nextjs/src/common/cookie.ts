import { DevCycleUser } from '@devcycle/js-client-sdk'

export type DVCCookie = {
    user: DevCycleUser
    timestamp: string
}

export const createCookieContents = (
    user: DevCycleUser,
    configTimestamp?: string,
) => {
    return JSON.stringify({ user, timestamp: configTimestamp })
}
export const cookieName = 'devcycle-next'

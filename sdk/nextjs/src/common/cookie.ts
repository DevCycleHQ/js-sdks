import { DevCycleUser } from '@devcycle/js-client-sdk'

export type DVCCookie = {
    user: DevCycleUser
    timestamp?: number
}

export const createCookieContents = (user: DevCycleUser): string => {
    return JSON.stringify({
        user,
        timestamp: Date.now(),
    })
}
export const cookieName = 'devcycle-next'

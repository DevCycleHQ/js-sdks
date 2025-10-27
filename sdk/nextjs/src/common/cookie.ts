import { DevCycleUser } from '@devcycle/js-client-sdk'

export type DVCCookie = {
    user: DevCycleUser
    fromClient: boolean
    debugMode?: boolean
    timestamp?: number
}

export const createCookieContents = (
    user: DevCycleUser,
    fromClient = false,
    debugMode = false,
): string => {
    return JSON.stringify({
        user,
        fromClient,
        debugMode,
        timestamp: Date.now(),
    })
}
export const cookieName = 'devcycle-next'

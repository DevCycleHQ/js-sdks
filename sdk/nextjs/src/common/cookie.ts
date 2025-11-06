import { DevCycleUser } from '@devcycle/js-client-sdk'

export type DVCCookie = {
    user: DevCycleUser
    fromClient: boolean
}

export const createCookieContents = (
    user: DevCycleUser,
    fromClient = false,
): string => {
    return JSON.stringify({ user, fromClient })
}
export const cookieName = 'devcycle-next'
export const debugUserCookieName = 'devcycle-web-debug-user'

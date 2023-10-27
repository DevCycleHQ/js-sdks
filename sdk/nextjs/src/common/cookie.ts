import { DevCycleUser } from '@devcycle/js-client-sdk'

export type DVCCookie = {
    user: DevCycleUser
    fromClient: boolean
}

export const createCookieContents = (
    user: DevCycleUser,
    fromClient: boolean = false,
) => {
    return JSON.stringify({ user, fromClient })
}
export const cookieName = 'devcycle-next'

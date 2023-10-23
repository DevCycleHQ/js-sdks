import { DevCycleUser } from '@devcycle/js-client-sdk'

export const createCookieContents = (user: DevCycleUser) => {
    return JSON.stringify({ user })
}
export const cookieName = 'devcycle-next'

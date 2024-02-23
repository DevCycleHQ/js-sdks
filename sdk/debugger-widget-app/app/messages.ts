import { DevCycleUser } from '@devcycle/js-client-sdk'

export const updateUserIdentity = (user: DevCycleUser, origin: string) => {
    console.log('POSTING MESSAGE TO ', origin)
    window.parent.postMessage({ type: 'DEVCYCLE_IDENTIFY_USER', user }, origin)
}

export const resetUserIdentity = (origin: string) => {
    window.parent.postMessage({ type: 'DEVCYCLE_RESET_USER' }, origin)
}

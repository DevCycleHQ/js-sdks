import { DVCOptions, initialize } from '@devcycle/devcycle-js-sdk'
import type { DVCUser, DVCClient } from '@devcycle/devcycle-js-sdk'

const initializeDVCClient = (
    sdkKey: string,
    user: DVCUser = { isAnonymous: true },
    options?: DVCOptions,
): DVCClient => {
    if (options?.deferInitialization) {
        return initialize(sdkKey, {
            ...options,
            deferInitialization: true, // make typescript happy
        })
    }
    return initialize(sdkKey, user, options)
}

export default initializeDVCClient

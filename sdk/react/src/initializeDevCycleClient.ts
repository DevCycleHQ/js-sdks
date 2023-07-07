import { DevCycleOptions, initializeDevCycle } from '@devcycle/devcycle-js-sdk'
import type { DevCycleUser, DevCycleClient } from '@devcycle/devcycle-js-sdk'

const initializeDevCycleClient = (
    sdkKey: string,
    user: DevCycleUser = { isAnonymous: true },
    options?: DevCycleOptions,
): DevCycleClient => {
    if (options?.deferInitialization) {
        return initializeDevCycle(sdkKey, {
            ...options,
            deferInitialization: true, // make typescript happy
        })
    }
    return initializeDevCycle(sdkKey, user, options)
}

export default initializeDevCycleClient

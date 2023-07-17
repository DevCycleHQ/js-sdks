import { DevCycleOptions, initializeDevCycle } from '@devcycle/js-client-sdk'
import type { DevCycleUser, DevCycleClient } from '@devcycle/js-client-sdk'

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

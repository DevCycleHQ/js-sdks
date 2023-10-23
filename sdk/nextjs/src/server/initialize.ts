import { DevCycleOptions, DevCycleUser } from '@devcycle/js-client-sdk'
import { identifyInitialUser, identifyUser } from './identify'
import { setSDKKey } from './context'

type DevCycleServerOptions = {
    initialUserOnly?: boolean
}

export const initialize = async (
    sdkKey: string,
    user: DevCycleUser,
    { initialUserOnly = true }: DevCycleServerOptions = {},
) => {
    setSDKKey(sdkKey)
    if (initialUserOnly) {
        await identifyInitialUser(user)
    } else {
        await identifyUser(user)
    }
}

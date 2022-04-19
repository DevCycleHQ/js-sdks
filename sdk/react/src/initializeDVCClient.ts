import { DVCOptions, initialize } from '@devcycle/devcycle-js-sdk'
import type { DVCUser, DVCClient } from '@devcycle/devcycle-js-sdk'

const initializeDVCClient = (
    environmentKey: string,
    user: DVCUser = { isAnonymous: true },
    options?: DVCOptions,
): DVCClient => {
    return initialize(environmentKey, user, options)
}

export default initializeDVCClient

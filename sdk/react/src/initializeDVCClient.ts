import { DVCOptions, initialize } from '@devcycle/devcycle-js-sdk'
import type { DVCUser, DVCClient } from '@devcycle/devcycle-js-sdk'

const initializeDVCClient = (
    environmentKey: string,
    user: DVCUser = { isAnonymous: true },
    options?: DVCOptions,
): DVCClient => {
    const client = initialize(environmentKey, user, options)
    return client
}

export default initializeDVCClient

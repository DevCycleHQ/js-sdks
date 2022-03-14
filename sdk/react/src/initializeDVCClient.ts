import { DVCOptions, initialize } from '@devcycle/devcycle-js-sdk'
import type { UserParam, DVCClient } from '@devcycle/devcycle-js-sdk'

const initializeDVCClient = async (
    environmentKey: string,
    user: UserParam = { isAnonymous: true },
    options?: DVCOptions,
): Promise<DVCClient> => {
    const client = initialize(environmentKey, user, options)

    return client.onClientInitialized()
}

export default initializeDVCClient

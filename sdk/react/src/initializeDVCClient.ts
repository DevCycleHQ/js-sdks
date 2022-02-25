import { initialize } from '@devcycle/devcycle-js-sdk'
import type { DVCUser, DVCClient } from '@devcycle/devcycle-js-sdk'

const initializeDVCClient = async (
    environmentKey: string,
    user: DVCUser = { isAnonymous: true },
): Promise<DVCClient> => {
<<<<<<< HEAD
    const client = initialize(environmentKey, user)

    return client.onClientInitialized()
=======
  const client = initialize(environmentKey, user)
  return client.onClientInitialized()
>>>>>>> [DVC-2081] chore: rename asyncWithDVCProvider to asyncDVCProvider
}

export default initializeDVCClient

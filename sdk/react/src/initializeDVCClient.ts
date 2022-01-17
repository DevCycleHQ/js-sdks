import { initialize } from '@devcycle/devcycle-js-sdk'
import { DVCUser, DVCClient } from 'dvc-js-client-sdk'

const initializeDVCClient = async (
  environmentKey: string,
  user: DVCUser = { isAnonymous: true },
): Promise<DVCClient> => {
  const client = initialize(environmentKey, user)

  return client.onClientInitialized()
}

export default initializeDVCClient

import 'server-only'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getBucketedConfig } from './bucketing'
import { setIdentity } from './context'

export const identifyUser = async (user: DevCycleUser) => {
    setIdentity(user)
    await getBucketedConfig()
}

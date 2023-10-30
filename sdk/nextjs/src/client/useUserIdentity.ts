import { useDevCycleClient } from './useDevCycleClient'
import { DVCPopulatedUser } from '@devcycle/js-client-sdk'

export const useUserIdentity = (): DVCPopulatedUser | undefined => {
    const client = useDevCycleClient()
    return client.user
}

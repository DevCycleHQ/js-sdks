import { useDevCycleClient } from './useDevCycleClient'

export const useUserIdentity = () => {
    const client = useDevCycleClient()
    return client.user
}

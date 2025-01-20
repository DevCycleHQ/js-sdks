import { DevCycleNextClient } from './internal/context'
import { useDevCycleClient as internalUseClient } from './internal/useDevCycleClient'

export const useDevCycleClient = (): DevCycleNextClient => {
    return internalUseClient()
}

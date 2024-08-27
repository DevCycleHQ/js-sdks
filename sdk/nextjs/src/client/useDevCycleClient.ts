import { useDevCycleClient as internalUseClient } from './internal/useDevCycleClient'
import { DevCycleClient } from '@devcycle/js-client-sdk'

export const useDevCycleClient = (): DevCycleClient => {
    return internalUseClient()
}

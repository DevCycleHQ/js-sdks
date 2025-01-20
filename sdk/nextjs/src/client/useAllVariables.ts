'use client'
import { useDevCycleClient } from './internal/useDevCycleClient'
import { useRerenderOnVariableChange } from './internal/useRerenderOnVariableChange'
import { DevCycleClient, DVCVariableSet } from '@devcycle/js-client-sdk'
import { use, useContext } from 'react'
import { DevCycleProviderContext } from './internal/context'

export const useAllVariables = (): DVCVariableSet => {
    const client = useDevCycleClient()
    const context = useContext(DevCycleProviderContext)

    useRerenderOnVariableChange()
    // Fall back to nearest suspense boundary if client is not initialized yet.
    if (context.enableStreaming) {
        use((client as DevCycleClient).onClientInitialized())
    }
    return client.allVariables()
}

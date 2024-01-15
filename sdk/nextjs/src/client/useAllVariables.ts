'use client'
import { useDevCycleClient } from './internal/useDevCycleClient'
import { useRerenderOnVariableChange } from './internal/useRerenderOnVariableChange'
import { DVCVariableSet } from '@devcycle/js-client-sdk'

export const useAllVariables = (): DVCVariableSet => {
    const client = useDevCycleClient()
    useRerenderOnVariableChange()
    return client.allVariables()
}

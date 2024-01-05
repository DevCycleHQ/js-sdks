'use client'
import { useDevCycleClient } from './internal/useDevCycleClient'
import { useRerenderOnVariableChange } from './internal/useRerenderOnVariableChange'

export const useAllVariables = (): void => {
    const client = useDevCycleClient()
    useRerenderOnVariableChange()
    client.allVariables()
}

'use client'
import { useDevCycleClient } from './internal/useDevCycleClient'
import { useRerenderOnVariableChange } from './internal/useRerenderOnVariableChange'

export const useAllFeatures = (): void => {
    const client = useDevCycleClient()
    useRerenderOnVariableChange()
    client.allFeatures()
}

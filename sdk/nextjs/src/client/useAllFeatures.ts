'use client'
import { useDevCycleClient } from './internal/useDevCycleClient'
import { useRerenderOnVariableChange } from './internal/useRerenderOnVariableChange'
import { DVCFeatureSet } from '@devcycle/js-client-sdk'

export const useAllFeatures = (): DVCFeatureSet => {
    const client = useDevCycleClient()
    useRerenderOnVariableChange()
    return client.allFeatures()
}

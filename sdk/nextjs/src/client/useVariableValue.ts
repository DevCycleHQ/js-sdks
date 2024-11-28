'use client'
import { DevCycleClient } from '@devcycle/js-client-sdk'
import { useContext, use } from 'react'
import { VariableDefinitions, VariableKey } from '@devcycle/types'
import { DVCVariable } from '@devcycle/js-client-sdk'
import { DevCycleProviderContext } from './internal/context'
import { useRerenderOnVariableChange } from './internal/useRerenderOnVariableChange'

export const useVariable = <
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
>(
    key: K,
    defaultValue: ValueType,
): DVCVariable<ValueType> => {
    const context = useContext(DevCycleProviderContext)
    useRerenderOnVariableChange(key)

    // Fall back to nearest suspense boundary if client is not initialized yet.
    if (context.enableStreaming) {
        use((context.client as DevCycleClient).onClientInitialized())
    }

    return context.client.variable(key, defaultValue)
}

export const useVariableValue = <
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
>(
    key: K,
    defaultValue: ValueType,
): DVCVariable<ValueType>['value'] => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue

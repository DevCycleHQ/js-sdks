'use client'
import type { DVCVariableValue } from '@devcycle/js-client-sdk'
import { useContext, use } from 'react'
import { VariableTypeAlias } from '@devcycle/types'
import { DVCVariable } from '@devcycle/js-client-sdk'
import { DevCycleProviderContext } from './internal/context'
import { useRerenderOnVariableChange } from './internal/useRerenderOnVariableChange'

export const useVariable = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): DVCVariable<T> => {
    const context = useContext(DevCycleProviderContext)
    useRerenderOnVariableChange(key)

    // Fall back to nearest suspense boundary if client is not initialized yet.
    if (context.enableStreaming) {
        use(context.serverDataPromise)
    }

    return context.client.variable(key, defaultValue)
}

export const useVariableValue = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): VariableTypeAlias<T> => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue

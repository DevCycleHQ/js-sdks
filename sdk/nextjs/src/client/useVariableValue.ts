'use client'
import type { DVCVariableValue } from '@devcycle/js-client-sdk'
import { useCallback, useContext, useEffect, useState } from 'react'
import { VariableTypeAlias } from '@devcycle/types'
import { DVCVariable } from '@devcycle/js-client-sdk'
import { DevCycleClientContext } from './DevCycleClientsideProvider'

export const useVariable = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): DVCVariable<T> => {
    const [_, forceRerender] = useState({})
    const forceRerenderCallback = useCallback(() => forceRerender({}), [])
    const context = useContext(DevCycleClientContext)

    // TODO - re-add when React 18.3 is released with a stable "use" function
    // Fall back to nearest suspense boundary if client is not initialized yet.
    // if (context.enableStreaming) {
    //     use(context.serverDataPromise)
    // }

    useEffect(() => {
        context.client.subscribe(
            `variableUpdated:${key}`,
            forceRerenderCallback,
        )
        return () => {
            context.client.unsubscribe(
                `variableUpdated:${key}`,
                forceRerenderCallback,
            )
        }
    }, [key, forceRerenderCallback])

    return context.client.variable(key, defaultValue)
}

export const useVariableValue = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): VariableTypeAlias<T> => {
    return useVariable(key, defaultValue).value
}

export default useVariableValue

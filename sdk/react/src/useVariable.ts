'use client'
import { useCallback, useContext, useEffect, useState } from 'react'
import context from './context'
import type {
    DVCVariable,
    DVCVariableValue,
    VariableKey,
} from '@devcycle/js-client-sdk'

export const useVariable = <T extends DVCVariableValue>(
    key: VariableKey,
    defaultValue: T,
): DVCVariable<T> => {
    const dvcContext = useContext(context)
    const [_, forceRerender] = useState({})
    const forceRerenderCallback = useCallback(() => forceRerender({}), [])

    if (dvcContext === undefined)
        throw new Error('useVariable must be used within DevCycleProvider')

    useEffect(() => {
        dvcContext.client.subscribe(
            `variableUpdated:${key}`,
            forceRerenderCallback,
        )
        return () => {
            dvcContext.client.unsubscribe(
                `variableUpdated:${key}`,
                forceRerenderCallback,
            )
        }
    }, [dvcContext, key, forceRerenderCallback])

    return dvcContext.client.variable(key, defaultValue)
}

export default useVariable

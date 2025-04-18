'use client'
import { useCallback, useContext, useEffect, useState } from 'react'
import context from './context'
import type { DVCVariable } from '@devcycle/js-client-sdk'
import { VariableDefinitions, VariableKey } from '@devcycle/types'

export const useVariable = <
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
>(
    key: K,
    defaultValue: ValueType,
): DVCVariable<ValueType> => {
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

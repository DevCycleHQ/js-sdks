'use client'
import type { DVCVariableValue } from '@devcycle/js-client-sdk'
import { useCallback, useState } from 'react'
import { dvcGlobal } from '../common/global'
import { VariableTypeAlias } from '@devcycle/types'

export const useVariableValue = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): VariableTypeAlias<T> => {
    const [_, forceRerender] = useState({})
    const forceRerenderCallback = useCallback(() => forceRerender({}), [])
    const client = dvcGlobal.devcycleClient

    return client
        ? client.variable(key, defaultValue).value
        : (defaultValue as VariableTypeAlias<T>)
}

export default useVariableValue

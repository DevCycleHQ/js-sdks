import { useCallback, useContext, useEffect, useState } from 'react'
import type { DVCVariable, DVCVariableValue } from '@devcycle/js-client-sdk'
import { getClient, getDevCycleClient } from '@devcycle/next-sdk/server'
import { useVariable as useClientSideVariable } from '@devcycle/react-client-sdk'
import { DevCycleClient } from '@devcycle/js-client-sdk'

export const useVariable = <T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): DVCVariable<T> => {
    const [_, forceRerender] = useState({})
    const forceRerenderCallback = useCallback(() => forceRerender({}), [])
    console.log('GETTING CLIENT')
    let client: DevCycleClient | undefined
    try {
        client = getClient()
    } catch (e) {
        console.log('Failed to get client', e)
    }
    console.log('GOT CLIENT')
    const clientVariable = useClientSideVariable(key, defaultValue)

    return client ? client.variable(key, defaultValue) : clientVariable
}

export default useVariable

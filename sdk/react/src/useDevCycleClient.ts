import { useContext } from 'react'
import context from './context'
import { DevCycleClient, VariableDefinitions } from '@devcycle/devcycle-js-sdk'

export const useDevCycleClient = <
    Variables extends VariableDefinitions = VariableDefinitions,
>(): DevCycleClient<Variables> => {
    const dvcContext = useContext(context)

    if (dvcContext === undefined)
        throw new Error('useDVCClient must be used within DVCProvider')

    return dvcContext.client
}

/**
 * @deprecated use useDevCycleClient instead
 */
export const useDVCClient = useDevCycleClient

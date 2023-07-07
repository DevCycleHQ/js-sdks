import { useContext } from 'react'
import context from './context'
import { DevCycleClient, VariableDefinitions } from '@devcycle/js-client-sdk'

export const useDevCycleClient = <
    Variables extends VariableDefinitions = VariableDefinitions,
>(): DevCycleClient<Variables> => {
    const dvcContext = useContext(context)

    if (dvcContext === undefined)
        throw new Error(
            'useDevCycleClient must be used within DevCycleProvider',
        )

    return dvcContext.client
}

/**
 * @deprecated use useDevCycleClient instead
 */
export const useDVCClient = useDevCycleClient

import { useContext } from 'react'
import context from './context'
import {
    DevCycleClient,
    VariableDefinitions,
    DVCCustomDataJSON,
} from '@devcycle/js-client-sdk'

export const useDevCycleClient = <
    Variables extends VariableDefinitions = VariableDefinitions,
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
>(): DevCycleClient<Variables, CustomData> => {
    const dvcContext = useContext(context)

    if (dvcContext === undefined)
        throw new Error(
            'useDevCycleClient must be used within DevCycleProvider',
        )

    // enforce the variable and custom data types provided by the user. These are for type-checking only.
    return dvcContext.client as unknown as DevCycleClient<Variables, CustomData>
}

/**
 * @deprecated use useDevCycleClient instead
 */
export const useDVCClient = useDevCycleClient

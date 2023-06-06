import { useContext } from 'react'
import context from './context'
import { DVCClient, VariableDefinitions } from '@devcycle/devcycle-js-sdk'

export const useDVCClient = <
    Variables extends VariableDefinitions = VariableDefinitions,
>(): DVCClient<Variables> => {
    const dvcContext = useContext(context)

    if (dvcContext === undefined)
        throw new Error('useDVCClient must be used within DVCProvider')

    return dvcContext.client
}

export default useDVCClient

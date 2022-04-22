import { useContext } from 'react'
import context from './context'
import { DVCClient } from '@devcycle/devcycle-js-sdk'

export const useDVCClient = (): DVCClient => {
    const dvcContext = useContext(context)

    if (dvcContext === undefined) throw new Error('useDVCClient must be used within DVCProvider')

    return dvcContext.client
}

export default useDVCClient

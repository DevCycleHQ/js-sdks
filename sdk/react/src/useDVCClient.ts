import { useContext } from 'react'
import context from './context'
import { DVCClient } from '@devcycle/devcycle-js-sdk'

export const useDVCClient = (): DVCClient | undefined => {
    const { client } = useContext(context)

    return client
}

export default useDVCClient

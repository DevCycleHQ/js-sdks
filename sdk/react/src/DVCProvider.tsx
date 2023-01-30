import { ProviderConfig } from './types'
import React, { ReactNode, useEffect } from 'react'
import initializeDVCClient from './initializeDVCClient'
import { Provider } from './context'
import { DVCClient } from '@devcycle/devcycle-js-sdk'

type Props = {
  config: ProviderConfig
  children: ReactNode
}

let client: DVCClient | undefined

export default function DVCProvider(props: Props): React.ReactElement {
    const { sdkKey, envKey, user, options } = props.config
    const key = sdkKey || envKey
    if (!key) {
        throw new Error('You must provide a sdkKey to DVCProvider')
    }

    if (!client) {
        client = initializeDVCClient(key, user, options)
    }

    useEffect(() => {
        return () => {
            client?.close()
            client = undefined
        }
    }, [])

    return (
        <Provider value={{ client }}>{props.children}</Provider>
    )
}

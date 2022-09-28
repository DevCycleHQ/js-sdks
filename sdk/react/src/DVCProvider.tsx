import { ProviderConfig } from './types'
import React, { ReactNode, useEffect, useState } from 'react'
import initializeDVCClient from './initializeDVCClient'
import { Provider } from './context'
import { DVCClient } from '@devcycle/devcycle-js-sdk'

type Props = {
  config: ProviderConfig
  children: ReactNode
}

let client: DVCClient | undefined

export default function DVCProvider(props: Props): React.ReactElement {
    const { envKey, user, options } = props.config
    const [_, forceRerender] = useState({})

    if (!client) {
        client = initializeDVCClient(envKey, user, options)
        client.subscribe('newVariables', () => {
            forceRerender({})
        })
    }

    useEffect(() => {
        return () => {
            client?.unsubscribe('newVariables')
            client?.close()
            client = undefined
        }
    }, [])

    return (
        <Provider value={{ client }}>{props.children}</Provider>
    )
}

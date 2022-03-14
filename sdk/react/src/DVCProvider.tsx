import { ProviderConfig } from './types'
import React, { ReactNode, useEffect, useState } from 'react'
import initializeDVCClient from './initializeDVCClient'
import { Provider } from './context'
import type { DVCClient, DVCVariable } from '@devcycle/devcycle-js-sdk'

type Props = {
  config: ProviderConfig
  children: ReactNode
}

export default function DVCProvider(props: Props): React.ReactElement {
    const { envKey, user, options } = props.config
    const [client, setClient] = useState<DVCClient | undefined>(undefined)
    const [variables, setVariables] = useState<{[key: string]: DVCVariable}>({})

    useEffect(() => {
        (async () => {
            const client = await initializeDVCClient(envKey, user)
            setClient(client)
            client.subscribe('variableUpdated:*', () => {
                setVariables({})
            })
        })()
    }, [])
  
    return (
        <Provider value={{ client, variables }}>{props.children}</Provider>
    )
}

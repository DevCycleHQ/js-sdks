import { ProviderConfig } from './types'
import React, { ReactNode, useEffect, useState } from 'react'
import initializeDVCClient from './initializeDVCClient'
import { Provider } from './context'
import { DVCClient } from '@devcycle/devcycle-js-sdk'

type Props = {
  config: ProviderConfig
  children: ReactNode
}

export default function DVCProvider(props: Props) {
    const { envKey, user } = props.config
    const [client, setClient] = useState<DVCClient | undefined>(undefined)

    useEffect(() => {
        (async () => {
            setClient(await initializeDVCClient(envKey, user))
        })()
    }, [])

    return (
        <Provider value={{ client }}>{props.children}</Provider>
    )
}

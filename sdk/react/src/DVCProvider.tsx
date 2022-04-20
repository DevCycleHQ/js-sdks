import { ProviderConfig } from './types'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import initializeDVCClient from './initializeDVCClient'
import { Provider } from './context'

type Props = {
  config: ProviderConfig
  children: ReactNode
}

export default function DVCProvider(props: Props): React.ReactElement {
    const { envKey, user, options } = props.config
    const client = useMemo(() => initializeDVCClient(envKey, user, options), [envKey, user, options])
    const [_, forceRerender] = useState({})

    useEffect(() => {
        client.subscribe('variableUpdated:*', () => {
            forceRerender({})
        })
    }, [])
  
    return (
        <Provider value={{ client }}>{props.children}</Provider>
    )
}

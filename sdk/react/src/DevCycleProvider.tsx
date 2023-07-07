import { ProviderConfig } from './types'
import React, { ReactNode, useEffect } from 'react'
import initializeDevCycleClient from './initializeDevCycleClient'
import { Provider } from './context'
import { DevCycleClient } from '@devcycle/devcycle-js-sdk'

type Props = {
    config: ProviderConfig
    children: ReactNode
}

let client: DevCycleClient | undefined

export function DevCycleProvider(props: Props): React.ReactElement {
    const { config } = props
    const { user, options } = config
    let sdkKey: string
    if ('sdkKey' in config) {
        sdkKey = config.sdkKey
    } else {
        sdkKey = config.envKey
    }
    if (!sdkKey) {
        throw new Error('You must provide a sdkKey to DevCycleProvider')
    }

    if (!client) {
        client = initializeDevCycleClient(sdkKey, user, options)
    }

    useEffect(() => {
        return () => {
            client?.close()
            client = undefined
        }
    }, [])

    return <Provider value={{ client }}>{props.children}</Provider>
}

/**
 * @deprecated Use DevCycleProvider instead
 */
export const DVCProvider = DevCycleProvider

'use client'
import { ProviderConfig } from './types'
import React, { ReactNode, useEffect, useState } from 'react'
import initializeDevCycleClient from './initializeDevCycleClient'
import { Provider, initializedContext } from './context'
import { DevCycleClient } from '@devcycle/js-client-sdk'

type Props = {
    config: ProviderConfig
    children: ReactNode
}

export function DevCycleProvider(props: Props): React.ReactElement {
    const { config } = props
    const { user, options } = config
    const [isInitialized, setIsInitialized] = useState(false)

    let sdkKey: string
    if ('sdkKey' in config) {
        sdkKey = config.sdkKey
    } else {
        sdkKey = config.envKey
    }
    if (!sdkKey) {
        throw new Error('You must provide a sdkKey to DevCycleProvider')
    }

    const [client] = useState<DevCycleClient>(
        initializeDevCycleClient(sdkKey, user, {
            ...options,
        }),
    )

    useEffect(() => {
        client
            .onClientInitialized()
            .then(() => {
                setIsInitialized(true)
            })
            .catch(() => {
                // set to true to unblock app load
                console.log('Error initializing DevCycle.')
                setIsInitialized(true)
            })

        return () => {
            void client.close()
        }
    }, [client])

    return (
        <Provider value={{ client }}>
            <initializedContext.Provider
                value={{
                    isInitialized: isInitialized || client.isInitialized,
                }}
            >
                {props.children}
            </initializedContext.Provider>
        </Provider>
    )
}

/**
 * @deprecated Use DevCycleProvider instead
 */
export const DVCProvider = DevCycleProvider

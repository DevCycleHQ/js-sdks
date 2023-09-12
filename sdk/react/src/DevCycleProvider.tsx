import { ProviderConfig } from './types'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
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
    const clientRef = useRef<DevCycleClient>()

    const initializedWatcher = useRef<boolean>(isInitialized)
    let sdkKey: string
    if ('sdkKey' in config) {
        sdkKey = config.sdkKey
    } else {
        sdkKey = config.envKey
    }
    if (!sdkKey) {
        throw new Error('You must provide a sdkKey to DevCycleProvider')
    }

    if (!clientRef.current) {
        // if on server, set deferInitialization to true
        clientRef.current = initializeDevCycleClient(sdkKey, user, {
            ...options,
            deferInitialization: typeof window === 'undefined',
        })
    }

    // ensure there is exactly one initialization event handler per provider
    // use a ref so we don't re-render while setting this up
    if (!initializedWatcher.current) {
        initializedWatcher.current = true
        clientRef.current
            .onClientInitialized()
            .then(() => {
                setIsInitialized(true)
            })
            .catch(() => {
                // set to true to unblock app load
                console.log('Error initializing DevCycle.')
                setIsInitialized(true)
            })
    }

    useEffect(() => {
        return () => {
            clientRef.current?.close()
            clientRef.current = undefined
        }
    }, [])

    return (
        <Provider value={{ client: clientRef.current }}>
            <initializedContext.Provider value={{ isInitialized }}>
                {props.children}
            </initializedContext.Provider>
        </Provider>
    )
}

/**
 * @deprecated Use DevCycleProvider instead
 */
export const DVCProvider = DevCycleProvider

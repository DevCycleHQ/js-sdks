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
        clientRef.current = initializeDevCycleClient(sdkKey, user, {
            ...options,
        })
    }

    useEffect(() => {
        // assert this is defined otherwise we have a bug
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clientRef
            .current!.onClientInitialized()
            .then(() => {
                setIsInitialized(true)
            })
            .catch(() => {
                // set to true to unblock app load
                console.log('Error initializing DevCycle.')
                setIsInitialized(true)
            })

        return () => {
            clientRef.current?.close()
        }
    }, [])

    return (
        <Provider value={{ client: clientRef.current }}>
            <initializedContext.Provider
                value={{
                    isInitialized:
                        isInitialized || clientRef.current.isInitialized,
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

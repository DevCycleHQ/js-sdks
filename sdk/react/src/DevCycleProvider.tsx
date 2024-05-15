'use client'
import { ProviderConfig } from './types'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import initializeDevCycleClient from './initializeDevCycleClient'
import {
    Provider,
    initializedContext,
    debugContext,
    debugContextDefaults,
} from './context'
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

    const clientRef = useRef<DevCycleClient>()
    const [_, forceRerender] = useState({})

    if (clientRef.current === undefined) {
        clientRef.current = initializeDevCycleClient(sdkKey, user, {
            ...options,
        })
    }

    useEffect(() => {
        if (clientRef.current === undefined) {
            clientRef.current = initializeDevCycleClient(sdkKey, user, {
                ...options,
            })
            // react doesn't know the effect changed the ref, make sure it re-renders
            forceRerender({})
        }

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

        return () => {
            void clientRef.current?.close()
            clientRef.current = undefined
        }
    }, [sdkKey, user, options])

    const mergedDebugOptions = Object.assign(
        {},
        debugContextDefaults,
        props.config.options?.reactDebug ?? {},
    )

    return (
        <Provider value={{ client: clientRef.current }}>
            <initializedContext.Provider
                value={{
                    isInitialized:
                        isInitialized || clientRef.current.isInitialized,
                }}
            >
                <debugContext.Provider value={mergedDebugOptions}>
                    {props.children}
                </debugContext.Provider>
            </initializedContext.Provider>
        </Provider>
    )
}

/**
 * @deprecated Use DevCycleProvider instead
 */
export const DVCProvider = DevCycleProvider

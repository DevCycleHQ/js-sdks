'use client'
import type { getDevCycleContext } from '@devcycle/next-sdk/server'
import React, { useEffect, useRef } from 'react'
import {
    DevCycleClient,
    DVCPopulatedUser,
    initializeDevCycle,
} from '@devcycle/js-client-sdk'
import { useRouter } from 'next/navigation'

type ClientDevCycleContext = Omit<
    Awaited<ReturnType<typeof getDevCycleContext>>,
    'populatedUser'
>

type DevCycleClientProviderProps = {
    context: ClientDevCycleContext
    children: React.ReactNode
}

export const ClientContext = React.createContext<DevCycleClient | undefined>(
    undefined,
)

export const DevCycleClientProviderClientSide = ({
    context,
    children,
}: DevCycleClientProviderProps) => {
    const router = useRouter()
    const clientRef = useRef<DevCycleClient>()

    if (!clientRef.current) {
        clientRef.current = initializeDevCycle(context.sdkKey, context.user!, {
            bootstrapConfig: context.config,
        })
    } else {
        // change user and config data to match latest server data
        // TODO make this a method on the client or find a more elegant way to do this
        clientRef.current.config = context.config
        clientRef.current.user = new DVCPopulatedUser(context.user!, {})
    }

    useEffect(() => {
        clientRef.current?.subscribe('configUpdated', () => {
            // trigger an in-place refetch of server components
            console.log('REFRESHING FROM CONFIG CHANGE!')
            router.refresh()
        })
        return () => {
            clientRef.current?.unsubscribe('configUpdated')
            clientRef.current = undefined
        }
    }, [])
    return (
        <ClientContext.Provider value={clientRef.current}>
            {children}
        </ClientContext.Provider>
    )
}

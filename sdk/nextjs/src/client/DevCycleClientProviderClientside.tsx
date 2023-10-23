'use client'
import type { getDevCycleContext } from '@devcycle/next-sdk/server'
import React, { useEffect, useRef, useState } from 'react'
import { DevCycleClient, initializeDevCycle } from '@devcycle/js-client-sdk'
import { useRouter } from 'next/navigation'
import { updateDVCCookie } from './updateDVCCookie'

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
    console.log('RECEIVED', context.user.user_id)
    const clientRef = useRef<DevCycleClient>()
    const [previousContext, setPreviousContext] = useState<
        ClientDevCycleContext | undefined
    >()

    if (!clientRef.current) {
        console.log('SETTING UP CLIENT')
        clientRef.current = initializeDevCycle(context.sdkKey, context.user!, {
            bootstrapConfig: context.config,
        })
    } else if (previousContext != context) {
        // change user and config data to match latest server data
        // if the data has changed since the last invocation
        console.log('SYNCHRONIZING BOOTSTRAP DATA')
        clientRef.current.synchronizeBootstrapData(context.config, context.user)
        setPreviousContext(context)
    }

    updateDVCCookie(clientRef.current!)

    useEffect(() => {
        const handler = () => {
            // trigger an in-place refetch of server components
            console.log('REFRESHING FROM CONFIG CHANGE!')
            router.refresh()
        }
        clientRef.current?.subscribe('configUpdated', handler)
        return () => {
            clientRef.current?.unsubscribe('configUpdated', handler)
        }
    }, [])

    return (
        <ClientContext.Provider value={clientRef.current}>
            {children}
        </ClientContext.Provider>
    )
}

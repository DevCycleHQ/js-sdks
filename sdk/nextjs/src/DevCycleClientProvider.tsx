import { getDevCycleContext } from '@devcycle/next-sdk/server'
import React from 'react'
import { initializeDevCycle } from '@devcycle/js-client-sdk'
import { DevCycleClientProviderClientSide } from './DevCycleClientProviderClientside'

type DevCycleClientProviderProps = {
    children: React.ReactNode
}

export const serverGlobal = globalThis as any

export const DevCycleClientProvider = async ({
    children,
}: DevCycleClientProviderProps) => {
    const context = await getDevCycleContext()
    if (!serverGlobal.devcycleClient) {
        serverGlobal.devcycleClient = initializeDevCycle(
            context.sdkKey,
            context.user!,
            {
                bootstrapConfig: context.config,
            },
        )
    }
    return (
        <>
            {/* this renders a client component that also sets the client on global*/}
            <DevCycleClientProviderClientSide context={context} />
            {children}
        </>
    )
}

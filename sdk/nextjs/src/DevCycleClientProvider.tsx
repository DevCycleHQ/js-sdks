import { getDevCycleContext, setClient } from '@devcycle/next-sdk/server'
import React from 'react'
import { DevCycleClient, DevCycleProvider } from '@devcycle/react-client-sdk'
import { initializeDevCycle } from '@devcycle/js-client-sdk'

type DevCycleClientProviderProps = {
    context: Awaited<ReturnType<typeof getDevCycleContext>>
    children: React.ReactNode
}

let devcycleClient: DevCycleClient

export const getDevCycleClient = () => devcycleClient

export const DevCycleClientProvider = ({
    children,
    context,
}: DevCycleClientProviderProps) => {
    if (!devcycleClient) {
        devcycleClient = initializeDevCycle(context.sdkKey, context.user!, {
            bootstrapConfig: context.config,
        })
        setClient(devcycleClient)
    }
    return (
        <DevCycleProvider
            config={{
                sdkKey: context.sdkKey,
                user: context.user,
                options: {
                    bootstrapConfig: context.config,
                },
            }}
        >
            {children}
        </DevCycleProvider>
    )
}

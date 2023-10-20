import { getDevCycleContext } from '@devcycle/next-sdk/server'
import React from 'react'
import { DevCycleProvider } from '@devcycle/react-client-sdk'

type DevCycleClientProviderProps = {
    context: Awaited<ReturnType<typeof getDevCycleContext>>
    children: React.ReactNode
}

export const DevCycleClientProvider = ({
    children,
    context,
}: DevCycleClientProviderProps) => {
    return (
        <DevCycleProvider
            config={{
                sdkKey: context.sdkKey,
                user: context.user,
                options: {},
            }}
        >
            {children}
        </DevCycleProvider>
    )
}

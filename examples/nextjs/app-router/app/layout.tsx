import '../styles/globals.css'
import * as React from 'react'
import {
    DevCycleClientProvider,
    DevCycleContext,
    getDevCycleContext,
    getSDKKey,
    getVariableValue,
    identifyUser,
    setSDKKey,
} from '@devcycle/next-sdk/server'

export default async function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
}: {
    children: React.ReactNode
}) {
    setSDKKey('client-c3b75096-70bb-47b8-9898-4f145f2caa26')
    await identifyUser({ user_id: 'test' })
    const variable = await getVariableValue('my-variable', false)
    console.log('VARIABLE', variable)
    return (
        <html lang="en">
            <body>
                <DevCycleClientProvider context={await getDevCycleContext()}>
                    {children}
                </DevCycleClientProvider>
            </body>
        </html>
    )
}

import '../styles/globals.css'
import * as React from 'react'
import {
    DevCycleClientProvider,
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
    // TODO these two calls could be one call
    // they could also be props to the provider component, but this allows variable usage before the provider
    // is rendered. Important?
    setSDKKey('client-c3b75096-70bb-47b8-9898-4f145f2caa26')
    await identifyUser({ user_id: 'test' })

    const variable = await getVariableValue('test-featre', false)
    console.log('SERVER VARIABLE', variable)
    return (
        <html lang="en">
            <body>
                {/* the provider doesnt actually "provide" anything, it just creates a client on global*/}
                {/* maybe a better name? It also doesnt need to wrap children*/}
                <DevCycleClientProvider>
                    <div>Server Variable! {JSON.stringify(variable)}</div>
                    {children}
                </DevCycleClientProvider>
            </body>
        </html>
    )
}

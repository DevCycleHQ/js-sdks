import '../styles/globals.css'
import * as React from 'react'
import {
    DevCycleClientProvider,
    getVariableValue,
    identifyUser,
    setSDKKey,
} from '@devcycle/next-sdk/server'

const serverIds = [
    'server-1',
    'server-2',
    'server-3',
    'server-4',
    'server-5',
    'server-6',
    'server-7',
    'server-8',
    'server-9',
    'server-10',
]

export default async function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
}: {
    children: React.ReactNode
}) {
    const randomId = serverIds[Math.floor(Math.random() * serverIds.length)]
    return (
        <html lang="en">
            <body>
                <DevCycleClientProvider
                    sdkKey={process.env.DEVCYCLE_CLIENT_SDK_KEY ?? ''}
                    user={{ user_id: randomId }}
                    options={{ initialUserOnly: true }}
                >
                    {children}
                </DevCycleClientProvider>
            </body>
        </html>
    )
}

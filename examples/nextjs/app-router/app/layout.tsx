import '../styles/globals.css'
import * as React from 'react'
import { DevCycleServersideProvider } from '@devcycle/next-sdk/server'

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <DevCycleServersideProvider
                    sdkKey={
                        process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY ?? ''
                    }
                    user={{ user_id: 'server-user' }}
                    options={{
                        enableStreaming: true,
                    }}
                >
                    {children}
                </DevCycleServersideProvider>
            </body>
        </html>
    )
}

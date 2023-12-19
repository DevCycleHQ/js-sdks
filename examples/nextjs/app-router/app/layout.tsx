import '../styles/globals.css'
import * as React from 'react'
import { DevCycleServersideProvider } from '@devcycle/nextjs-sdk/server'

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
                    user={{
                        user_id:
                            process.env.NEXT_PUBLIC_USER_ID || 'server-user',
                    }}
                    options={
                        {
                            // enableStreaming:
                            //     process.env.NEXT_PUBLIC_ENABLE_STREAMING === '1',
                        }
                    }
                >
                    {children}
                </DevCycleServersideProvider>
            </body>
        </html>
    )
}

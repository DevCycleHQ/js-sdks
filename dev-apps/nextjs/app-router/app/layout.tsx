import '../styles/globals.css'
import * as React from 'react'
import { DevCycleClientsideProvider } from '@devcycle/nextjs-sdk'
import { getClientContext } from './devcycle'

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <DevCycleClientsideProvider context={getClientContext()}>
                    {children}
                </DevCycleClientsideProvider>
            </body>
        </html>
    )
}

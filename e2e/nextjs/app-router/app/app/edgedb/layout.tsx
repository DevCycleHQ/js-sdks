import type { Metadata } from 'next'
import React from 'react'
import { DevCycleClientsideProvider } from '@devcycle/nextjs-sdk'
import { getClientContext } from './devcycle'

export const metadata: Metadata = {
    title: 'EdgeDB Test',
    description: 'EdgeDB e2e test page',
}

export default async function EdgeDBLayout({
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

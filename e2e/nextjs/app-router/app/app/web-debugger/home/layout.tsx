import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
    title: 'Home Page',
    description: 'Home page',
}

export default async function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

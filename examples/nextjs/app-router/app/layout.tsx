import '../styles/globals.css'
import * as React from 'react'
import { WithProviders } from './providers'

export default function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <WithProviders>{children}</WithProviders>
            </body>
        </html>
    )
}

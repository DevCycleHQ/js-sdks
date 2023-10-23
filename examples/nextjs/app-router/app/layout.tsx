import '../styles/globals.css'
import * as React from 'react'
import {
    DevCycleClientProvider,
    getVariableValue,
    identifyUser,
    initialize,
    setSDKKey,
} from '@devcycle/next-sdk/server'

export default async function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
}: {
    children: React.ReactNode
}) {
    await initialize('client-c3b75096-70bb-47b8-9898-4f145f2caa26', {
        user_id: 'test',
    })

    return (
        <html lang="en">
            <body>
                {/* the provider doesnt actually "provide" anything, it just creates a client on global*/}
                {/* maybe a better name? It also doesnt need to wrap children*/}
                <DevCycleClientProvider
                    sdkKey={'client-c3b75096-70bb-47b8-9898-4f145f2caa26'}
                    user={{ user_id: 'test' }}
                >
                    <div>
                        Server Variable!{' '}
                        {JSON.stringify(
                            await getVariableValue('test-featre', false),
                        )}
                    </div>
                    {children}
                </DevCycleClientProvider>
            </body>
        </html>
    )
}

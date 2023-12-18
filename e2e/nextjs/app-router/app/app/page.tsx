import { ClientComponent } from '@/app/ClientComponent'
import { ServerComponent } from '@/app/ServerComponent'
import React, { Suspense } from 'react'
import { DevCycleServersideProvider } from '@devcycle/nextjs-sdk/server'

export const Home = ({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) => {
    const enableStreaming = searchParams['enableStreaming'] === '1'
    return (
        <main>
            {enableStreaming ? (
                <div>Streaming Enabled</div>
            ) : (
                <div>Streaming Disabled</div>
            )}
            <DevCycleServersideProvider
                sdkKey={process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY ?? ''}
                user={{ user_id: '123' }}
                options={{
                    enableStreaming,
                }}
            >
                <Suspense fallback={<div>Loading...</div>}>
                    <ClientComponent />
                    <ServerComponent />
                </Suspense>
            </DevCycleServersideProvider>
        </main>
    )
}

export default Home

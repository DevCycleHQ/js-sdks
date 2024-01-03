import { ClientComponent } from '@/app/ClientComponent'
import { ServerComponent } from '@/app/ServerComponent'
import React, { Suspense } from 'react'
import Link from 'next/link'

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

            <Suspense fallback={<div>Loading...</div>}>
                <ClientComponent />
                <ServerComponent />
            </Suspense>
            <Link href="/test">Go To page</Link>
        </main>
    )
}

export default Home

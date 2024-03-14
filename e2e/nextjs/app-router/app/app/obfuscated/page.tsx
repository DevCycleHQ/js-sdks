import { ClientComponent } from './ClientComponent'
import { ServerComponent } from './ServerComponent'
import React, { Suspense } from 'react'
import Link from 'next/link'

const Home = async () => {
    return (
        <main>
            <div>Streaming Disabled</div>
            <Suspense fallback={<div>Loading...</div>}>
                <ClientComponent />
                <ServerComponent />
            </Suspense>
            <Link href="/obfuscated/test">Go To page</Link>
        </main>
    )
}

export default Home

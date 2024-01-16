import { ClientComponent } from './ClientComponent'
import { ServerComponent } from './ServerComponent'
import React, { Suspense } from 'react'
import Link from 'next/link'

const Home = () => {
    return (
        <main>
            <div>Streaming Enabled</div>
            <Suspense fallback={<div>Loading...</div>}>
                <ClientComponent />
                <ServerComponent />
            </Suspense>
            <Link href="/streaming/test">Go To page</Link>
        </main>
    )
}

export default Home

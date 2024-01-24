import { ClientComponent } from './ClientComponent'
import { ServerComponent } from './ServerComponent'
import React, { Suspense } from 'react'
import Link from 'next/link'
import {
    // ifEnabled,
    // Test,
    // DevCycleClientsideProvider,
    ifEnabled,
} from '@devcycle/nextjs-sdk'

// console.log('if enabled', ifEnabled)
// console.log('test', Test)
// Test()
// console.log('devcycle', DevCycleClientsideProvider)

const Home = async () => {
    return (
        <main>
            <div>Streaming Disabled</div>
            <Suspense fallback={<div>Loading...</div>}>
                <ClientComponent />
                <ServerComponent />
                {/*<ConditionalComponent />*/}
            </Suspense>
            <Link href="/normal/test">Go To page</Link>
        </main>
    )
}

export default Home

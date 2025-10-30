import { ClientComponent } from './ClientComponent'
import { ServerComponent } from './ServerComponent'
import React, { Suspense } from 'react'

const Home = async () => {
    return (
        <main>
            <div>EdgeDB Enabled</div>
            <Suspense fallback={<div>Loading...</div>}>
                <ClientComponent />
                <ServerComponent />
            </Suspense>
        </main>
    )
}

export default Home

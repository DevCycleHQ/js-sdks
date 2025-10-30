import { ClientComponent } from './ClientComponent'
import { ServerComponent } from './ServerComponent'
import React, { Suspense } from 'react'

const EdgeDBPage = async () => {
    return (
        <main>
            <div>EdgeDB Test Page</div>
            <Suspense fallback={<div>Loading...</div>}>
                <ClientComponent />
                <ServerComponent />
            </Suspense>
        </main>
    )
}

export default EdgeDBPage

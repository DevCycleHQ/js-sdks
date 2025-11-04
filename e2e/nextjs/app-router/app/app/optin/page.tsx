import { ClientComponent } from './ClientComponent'
import { ServerComponent } from './ServerComponent'
import React, { Suspense } from 'react'

const OptInPage = async () => {
    return (
        <main>
            <div>OptIn Test Page</div>
            <Suspense fallback={<div>Loading...</div>}>
                <ClientComponent />
                <ServerComponent />
            </Suspense>
        </main>
    )
}

export default OptInPage

import type { NextPage } from 'next'
import { ReactNode, Suspense } from 'react'
import * as React from 'react'
import { ServerIdentity } from './ServerIdentity'
import { ClientIdentity } from './ClientIdentity'
import { ClientComponent } from './ClientComponent'

const Page: NextPage = async ({ children }: { children: ReactNode }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '400px',
                padding: '20px',
            }}
        >
            <div
                style={{
                    backgroundColor: '#FFD',
                }}
            >
                Server content without a variable call
            </div>
            <br />
            <Suspense fallback={<div>Loading Server...</div>}>
                <ServerIdentity />
            </Suspense>
            <br />
            <ClientComponent />
            <br />
            <Suspense fallback={<div>Loading Client...</div>}>
                <ClientIdentity />
            </Suspense>
            {children}
        </div>
    )
}

export default Page

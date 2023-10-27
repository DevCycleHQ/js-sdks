import type { NextPage } from 'next'
import { ReactNode, Suspense } from 'react'
import ClientSide from './clientside'
import * as React from 'react'
import { ServerIdentity } from './ServerIdentity'

const Page: NextPage = async ({ children }: { children: ReactNode }) => {
    return (
        <ClientSide>
            <Suspense fallback={<div>Loading...</div>}>
                <ServerIdentity />
            </Suspense>
            {children}
        </ClientSide>
    )
}

export default Page

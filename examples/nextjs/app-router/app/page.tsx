import type { NextPage } from 'next'
import { ReactNode } from 'react'
import ClientSide from './clientside'
import * as React from 'react'
import { ServerIdentity } from './ServerIdentity'

const Page: NextPage = async ({ children }: { children: ReactNode }) => {
    return (
        <ClientSide>
            <ServerIdentity />
            {children}
        </ClientSide>
    )
}

export default Page

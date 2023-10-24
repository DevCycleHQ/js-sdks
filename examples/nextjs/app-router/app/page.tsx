import type { NextPage } from 'next'
import { ReactNode } from 'react'
import ClientSide from './clientside'
import {
    getUserIdentity,
    getVariableValue,
    identifyUser,
} from '@devcycle/next-sdk/server'
import * as React from 'react'

async function ServerData() {
    await identifyUser({ user_id: 'server-override' })

    return (
        <>
            <b>Server Variable</b>
            <span>
                {' '}
                {JSON.stringify(await getVariableValue('test-featre', false))}
            </span>
            <b>Server Identity</b>
            <span>{getUserIdentity()?.user_id}</span>
        </>
    )
}

const Page: NextPage = async ({ children }: { children: ReactNode }) => {
    console.log('RENDERING')

    return (
        <ClientSide>
            <ServerData />
            {children}
        </ClientSide>
    )
}

export default Page

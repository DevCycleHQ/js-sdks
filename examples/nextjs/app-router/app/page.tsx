import type { NextPage } from 'next'
import { ReactNode } from 'react'
import Home from './clientside'
import { getUserIdentity, getVariableValue } from '@devcycle/next-sdk/server'
import * as React from 'react'

async function ServerData() {
    return (
        <>
            <h2>Server Variable</h2>
            <h3>
                {' '}
                {JSON.stringify(await getVariableValue('test-featre', false))}
            </h3>
            <h2>Server Identity</h2>
            <h3>{getUserIdentity()?.user_id}</h3>
        </>
    )
}

const Page: NextPage = ({ children }: { children: ReactNode }) => {
    console.log('RENDERING')

    return (
        <Home>
            <ServerData />
        </Home>
    )
}

export default Page

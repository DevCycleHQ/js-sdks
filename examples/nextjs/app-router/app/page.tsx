import type { NextPage } from 'next'
import { ReactNode } from 'react'
import Home from './clientside'
import { getUserIdentity, getVariableValue } from '@devcycle/next-sdk/server'
import * as React from 'react'

async function ServerData() {
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

const Page: NextPage = ({ children }: { children: ReactNode }) => {
    console.log('RENDERING')

    return (
        <Home>
            <ServerData />
        </Home>
    )
}

export default Page

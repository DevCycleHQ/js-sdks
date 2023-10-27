import { getUserIdentity, getVariableValue } from '@devcycle/next-sdk/server'
import * as React from 'react'

export const ServerIdentity = async function () {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FDD',
            }}
        >
            <b>Server Variable</b>
            <span>
                {' '}
                {JSON.stringify(await getVariableValue('test-featre', false))}
            </span>
            <b>Server Identity</b>
            <span>{getUserIdentity()?.user_id}</span>
        </div>
    )
}

import { getUserIdentity, getVariableValue } from '@devcycle/nextjs-sdk/server'
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
            <span data-testid={'server-variable-value'}>
                {' '}
                {JSON.stringify(await getVariableValue('test-featre', false))}
            </span>
            <b>Server Identity</b>
            <span data-testid={'server-user-id'}>
                {getUserIdentity()?.user_id}
            </span>
        </div>
    )
}

'use client'
import { useUserIdentity, useVariableValue } from '@devcycle/nextjs-sdk'

export const ClientIdentity = () => {
    const variable = useVariableValue('test-featre', false)
    const userIdentity = useUserIdentity()
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#DDF',
            }}
        >
            <b>Client Variable</b>
            <span data-testid={'client-variable-value'}>
                {JSON.stringify(variable)}
            </span>
            <b>Client User Identity</b>
            <span data-testid={'client-user-id'}>{userIdentity?.user_id}</span>
            <br />
        </div>
    )
}

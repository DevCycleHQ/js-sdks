'use client'
import { useUserIdentity, useVariableValue } from '@devcycle/next-sdk'

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
            <span>{JSON.stringify(variable)}</span>
            <b>Client User Identity</b>
            <span>{userIdentity?.user_id}</span>
            <br />
        </div>
    )
}

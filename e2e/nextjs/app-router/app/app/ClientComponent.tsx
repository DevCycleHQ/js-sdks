'use client'
import { useVariableValue } from '@devcycle/nextjs-sdk'

export const ClientComponent = () => {
    const variable = useVariableValue('variable-key', false)

    return (
        <div>
            <h1>Client Component</h1>
            <p>Client Variable: {JSON.stringify(variable)}</p>
        </div>
    )
}

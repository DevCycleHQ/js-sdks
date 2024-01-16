'use client'
import { useVariableValue } from '@devcycle/nextjs-sdk'

export const ClientComponent = () => {
    const enabledVar = useVariableValue('enabled-feature', false)
    const disabledVar = useVariableValue('disabled-feature', false)

    return (
        <div>
            <h1>Navigated Client Component</h1>
            <p>Client Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(disabledVar)}</p>
        </div>
    )
}

'use client'
import { useVariableValue } from '@devcycle/nextjs-sdk'
import { DISABLED_FEATURE, ENABLED_FEATURE } from '@/dvcVariableTypes'

export const ClientComponent = () => {
    const enabledVar = useVariableValue(ENABLED_FEATURE, false)
    const disabledVar = useVariableValue(DISABLED_FEATURE, false)

    return (
        <div>
            <h1>Navigated Client Component</h1>
            <p>Client Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(disabledVar)}</p>
        </div>
    )
}

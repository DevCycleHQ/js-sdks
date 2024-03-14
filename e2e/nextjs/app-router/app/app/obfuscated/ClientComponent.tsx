'use client'
import {
    useVariableValue,
    useAllVariables,
    useAllFeatures,
    renderIfEnabled,
} from '@devcycle/nextjs-sdk'
import { DISABLED_FEATURE, ENABLED_FEATURE } from '@/dvcVariableTypes'

const ConditionalComponent = renderIfEnabled(
    ENABLED_FEATURE,
    () => import('./ConditionalClientComponent'),
)

export const ClientComponent = () => {
    const enabledVar = useVariableValue(ENABLED_FEATURE, false)
    const disabledVar = useVariableValue(DISABLED_FEATURE, false)
    const allVariables = useAllVariables()
    const allFeatures = useAllFeatures()

    return (
        <div>
            <h1>Client Component</h1>
            <p>Client Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Client All Variables: {JSON.stringify(allVariables)}</p>
            <p>Client All Features: {JSON.stringify(allFeatures)}</p>
            <ConditionalComponent />
        </div>
    )
}

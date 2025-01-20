'use client'
import {
    useVariableValue,
    useAllVariables,
    useAllFeatures,
    renderIfEnabled,
} from '@devcycle/nextjs-sdk'

const ConditionalComponent = renderIfEnabled(
    'enabled-feature',
    () => import('./ConditionalClientComponent'),
)

export const ClientComponent = () => {
    const enabledVar = useVariableValue('enabled-feature', false)
    const disabledVar = useVariableValue('disabled-feature', false)
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

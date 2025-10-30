'use client'
import {
    useVariableValue,
    useAllVariables,
    useAllFeatures,
} from '@devcycle/nextjs-sdk'

export const ClientComponent = () => {
    const enabledVar = useVariableValue('enabled-feature', false)
    const disabledVar = useVariableValue('disabled-feature', false)
    const allVariables = useAllVariables()
    const allFeatures = useAllFeatures()

    // EdgeDB-targeted features
    const premiumFeature = useVariableValue('edgedb-premium-feature', false)
    const registeredAccess = useVariableValue('registered-access', false)

    return (
        <div>
            <h1>Client Component (EdgeDB Enabled)</h1>
            <p>Client Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Client All Variables: {JSON.stringify(allVariables)}</p>
            <p>Client All Features: {JSON.stringify(allFeatures)}</p>
            <h2>EdgeDB-Targeted Features:</h2>
            <p>Client Premium Feature: {JSON.stringify(premiumFeature)}</p>
            <p>Client Registered Access: {JSON.stringify(registeredAccess)}</p>
        </div>
    )
}

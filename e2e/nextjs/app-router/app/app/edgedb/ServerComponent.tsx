import { headers } from 'next/headers'
import { getAllFeatures, getAllVariables, getVariableValue } from './devcycle'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)
    const allVariables = await getAllVariables()
    const allFeatures = await getAllFeatures()
    const reqHeaders = await headers()

    // EdgeDB-targeted features
    const premiumFeature = await getVariableValue(
        'edgedb-premium-feature',
        false,
    )
    const registeredAccess = await getVariableValue('registered-access', false)
    const usPremiumFeature = await getVariableValue('us-premium-feature', false)

    return (
        <div>
            <h1>Server Component (EdgeDB Enabled)</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Server All Variables: {JSON.stringify(allVariables)}</p>
            <p>Server All Features: {JSON.stringify(allFeatures)}</p>
            <p>
                Middleware Enabled Feature:{' '}
                {reqHeaders.get('Middleware-Enabled-Feature')}
            </p>
            <h2>EdgeDB-Targeted Features:</h2>
            <p>Server Premium Feature: {JSON.stringify(premiumFeature)}</p>
            <p>Server Registered Access: {JSON.stringify(registeredAccess)}</p>
            <p>Server US Premium Feature: {JSON.stringify(usPremiumFeature)}</p>
        </div>
    )
}

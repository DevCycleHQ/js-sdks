import { headers } from 'next/headers'
import { getAllFeatures, getAllVariables, getVariableValue } from './devcycle'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)
    const allVariables = await getAllVariables()
    const allFeatures = await getAllFeatures()
    const reqHeaders = await headers()

    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Server All Variables: {JSON.stringify(allVariables)}</p>
            <p>Server All Features: {JSON.stringify(allFeatures)}</p>
            <p>
                Middleware Enabled Feature:{' '}
                {reqHeaders.get('Middleware-Enabled-Feature')}
            </p>
        </div>
    )
}

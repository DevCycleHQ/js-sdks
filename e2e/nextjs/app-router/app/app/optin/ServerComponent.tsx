import { getAllFeatures, getAllVariables, getVariableValue } from './devcycle'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)
    const allVariables = await getAllVariables()
    const allFeatures = await getAllFeatures()

    const optInEnabledFeature = await getVariableValue(
        'opt-in-feature',
        'default',
    )

    return (
        <div>
            <h1>Server Component (OptIn Enabled)</h1>
            <p>Client Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Client All Variables: {JSON.stringify(allVariables)}</p>
            <p>Client All Features: {JSON.stringify(allFeatures)}</p>
            <h2>OptIn-Targeted Features:</h2>
            <p>Client OptIn Enabled Feature: {optInEnabledFeature}</p>
        </div>
    )
}

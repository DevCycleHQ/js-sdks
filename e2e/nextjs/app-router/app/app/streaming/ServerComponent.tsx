import { getAllFeatures, getAllVariables, getVariableValue } from './devcycle'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)
    const compromisedToken = await getVariableValue(
        'show-client-warning',
        false,
    )

    const allVariables = await getAllVariables()
    const allFeatures = await getAllFeatures()

    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Server Compromised Token: {JSON.stringify(compromisedToken)}</p>
            {/* <p>Server All Variables: {JSON.stringify(allVariables)}</p>
            <p>Server All Features: {JSON.stringify(allFeatures)}</p> */}
        </div>
    )
}

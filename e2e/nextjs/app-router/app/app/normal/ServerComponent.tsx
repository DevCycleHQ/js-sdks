import {
    getAllFeatures,
    getAllVariables,
    getFlag,
    getVariableValue,
} from './devcycle'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)
    const allVariables = await getAllVariables()
    const allFeatures = await getAllFeatures()

    const vercelFlag = await getFlag('enabled-feature', false)

    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Server All Variables: {JSON.stringify(allVariables)}</p>
            <p>Server All Features: {JSON.stringify(allFeatures)}</p>
            <p>Vercel Flag: {JSON.stringify(vercelFlag)}</p>
        </div>
    )
}

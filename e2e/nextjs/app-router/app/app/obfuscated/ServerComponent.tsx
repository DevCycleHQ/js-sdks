import { getAllFeatures, getAllVariables, getVariableValue } from './devcycle'
import { DISABLED_FEATURE, ENABLED_FEATURE } from '@/dvcVariableTypes'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue(ENABLED_FEATURE, false)
    const disabledVar = await getVariableValue(DISABLED_FEATURE, false)
    const allVariables = await getAllVariables()
    const allFeatures = await getAllFeatures()

    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Server All Variables: {JSON.stringify(allVariables)}</p>
            <p>Server All Features: {JSON.stringify(allFeatures)}</p>
        </div>
    )
}

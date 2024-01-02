import { getVariableValue } from './shared'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)

    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
        </div>
    )
}

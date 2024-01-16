import { getVariableValue } from '../devcycle'
export const ServerComponent = async () => {
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)

    return (
        <div>
            <h1>Navigated Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
        </div>
    )
}

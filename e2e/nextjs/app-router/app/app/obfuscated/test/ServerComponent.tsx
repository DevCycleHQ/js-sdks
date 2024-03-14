import { getVariableValue } from '../devcycle'
import { DISABLED_FEATURE, ENABLED_FEATURE } from '@/dvcVariableTypes'

export const ServerComponent = async () => {
    const enabledVar = await getVariableValue(ENABLED_FEATURE, false)
    const disabledVar = await getVariableValue(DISABLED_FEATURE, false)

    return (
        <div>
            <h1>Navigated Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
        </div>
    )
}

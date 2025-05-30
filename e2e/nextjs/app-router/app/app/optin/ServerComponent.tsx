import { getVariableValue } from './devcycle'
export const ServerComponent = async () => {
    const optInValue = await getVariableValue('opt-in-feature', 'off')

    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Enabled Variable: {optInValue}</p>
        </div>
    )
}

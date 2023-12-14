import { getVariableValue } from '@devcycle/nextjs-sdk/server'
export const ServerComponent = async () => {
    const variable = await getVariableValue('variable', false)
    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Variable: {JSON.stringify(variable)}</p>
        </div>
    )
}

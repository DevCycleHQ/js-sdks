import { getVariableValue } from '@devcycle/nextjs-sdk/server'
export const ServerComponent = async () => {
    console.log('starting server component')
    const enabledVar = await getVariableValue('enabled-feature', false)
    const disabledVar = await getVariableValue('disabled-feature', false)
    console.log('finished server component')

    return (
        <div>
            <h1>Server Component</h1>
            <p>Server Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(disabledVar)}</p>
        </div>
    )
}

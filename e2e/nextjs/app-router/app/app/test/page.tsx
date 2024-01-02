import { getVariableValue } from '../shared'

export default async function Page() {
    console.log('RUNNING TEST PAGE')
    await getVariableValue('boolean-flag', false)
    return <div>Page</div>
}

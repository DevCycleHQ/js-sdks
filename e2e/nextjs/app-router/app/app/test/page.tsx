import { getVariableValue } from '../shared'

export default async function Page() {
    await getVariableValue('boolean-flag', false)
    return <div>Page</div>
}

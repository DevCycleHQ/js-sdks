import { getClient, getInitializedPromise } from './requestContext'
import { DVCVariableValue } from '@devcycle/js-client-sdk'
import { VariableTypeAlias } from '@devcycle/types'

export async function getVariableValue<T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): Promise<VariableTypeAlias<T>> {
    const initializedPromise = getInitializedPromise()
    await initializedPromise

    const client = getClient()
    if (!client) {
        console.error(
            'getVariableValue can only be called within a DevCycleServersideProvider',
        )
        return defaultValue as VariableTypeAlias<T>
    }

    const variable = client.variable(key, defaultValue)

    return variable.value
}

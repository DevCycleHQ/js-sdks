import { getClient } from './requestContext'
import { DVCVariableValue } from '@devcycle/js-client-sdk'
import { VariableTypeAlias } from '@devcycle/types'

export async function getVariableValue<T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): Promise<VariableTypeAlias<T>> {
    const client = getClient()
    if (!client) {
        console.error(
            'React cache API is not working as expected. Please contact DevCycle support.',
        )
        return defaultValue as VariableTypeAlias<T>
    }

    const variable = client.variable(key, defaultValue)

    return variable.value
}

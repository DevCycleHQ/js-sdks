import { getClient } from './requestContext'
import {
    VariableDefinitions,
    VariableKey,
    VariableTypeAlias,
} from '@devcycle/types'

export async function getVariableValue<
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
>(key: K, defaultValue: ValueType): Promise<VariableTypeAlias<ValueType>> {
    const client = getClient()
    if (!client) {
        console.error(
            'React cache API is not working as expected. Please contact DevCycle support.',
        )
        return defaultValue as VariableTypeAlias<ValueType>
    }

    const variable = client.variable(key, defaultValue)

    return variable.value
}

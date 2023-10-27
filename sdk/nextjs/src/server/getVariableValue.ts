import { getBucketedConfig } from './bucketing'
import {
    addTrackedEvent,
    getClient,
    getInitializedPromise,
} from './requestContext'
import { DVCVariableValue } from '@devcycle/js-client-sdk'

export async function getVariableValue<T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
) {
    await getInitializedPromise()
    const client = getClient()
    if (!client) {
        console.error(
            'getVariableValue can only be called within a DevCycleServersideProvider',
        )
        return defaultValue
    }

    const variable = client.variable(key, defaultValue)
    if (variable.isDefaulted) {
        addTrackedEvent('variableDefaulted', key)
    } else {
        addTrackedEvent('variableEvaluated', key)
    }

    return variable.value
}

import { getBucketedConfig } from './bucketing'
import {
    addTrackedEvent,
    getClient,
    getInitializedPromise,
    getOptions,
} from './requestContext'
import { DVCVariableValue } from '@devcycle/js-client-sdk'

export async function getVariableValue<T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
) {
    const { enableStreaming } = getOptions()
    const initializedPromise = getInitializedPromise()
    await initializedPromise

    const client = getClient()
    if (!client) {
        console.error(
            'getVariableValue can only be called within a DevCycleServersideProvider',
        )
        return defaultValue
    }

    const variable = client.variable(key, defaultValue)
    if (variable.isDefaulted) {
        addTrackedEvent({ type: 'variableDefaulted', target: key })
    } else {
        addTrackedEvent({ type: 'variableEvaluated', target: key })
    }

    return variable.value
}

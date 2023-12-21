import { getClient, getInitializedPromise } from './requestContext'
import { DVCVariableValue } from '@devcycle/js-client-sdk'
import { VariableTypeAlias } from '@devcycle/types'

/**
 * keep waiting until next tick to ensure that root layout render has been started and the
 * initialization promise has been set. Counterintuitively, Next seems to call the render of pages before layouts
 * Will keep ticking up to 50 times then give up with an error
 */
const waitForPromiseAvailable = async () => {
    let initializedPromise = getInitializedPromise()
    let attempts = 0

    while (!initializedPromise && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve))
        initializedPromise = getInitializedPromise()
        attempts++
    }

    if (!initializedPromise) {
        throw new Error(
            'DevCycle server context not found! Did you wrap the root layout in DevCycleServersideProvider?',
        )
    }

    return { initializedPromise }
}

export async function getVariableValue<T extends DVCVariableValue>(
    key: string,
    defaultValue: T,
): Promise<VariableTypeAlias<T>> {
    const { initializedPromise } = await waitForPromiseAvailable()
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

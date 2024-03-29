import { getClient } from './requestContext'
import { DVCVariableSet } from '@devcycle/js-client-sdk'

export async function getAllVariables(): Promise<DVCVariableSet> {
    const client = getClient()
    if (!client) {
        console.error(
            'React cache API is not working as expected. Please contact DevCycle support.',
        )
        return {}
    }

    return client.allVariables()
}

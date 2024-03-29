import { getClient } from './requestContext'
import { DVCFeatureSet } from '@devcycle/js-client-sdk'

export async function getAllFeatures(): Promise<DVCFeatureSet> {
    const client = getClient()
    if (!client) {
        console.error(
            'React cache API is not working as expected. Please contact DevCycle support.',
        )
        return {}
    }

    return client.allFeatures()
}

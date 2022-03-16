import { DVCOptions, DVCClient as DVCClientInterface } from './types'
import { DVCClient } from './client'

export { defaultLogger } from './utils/logger'

export * from './types'

export function initialize(environmentKey: string, options?: DVCOptions): DVCClientInterface {
    if (!environmentKey) {
        throw new Error('Missing environment key! Call initialize with a valid environment key')
    }

    return new DVCClient(environmentKey, options)
}

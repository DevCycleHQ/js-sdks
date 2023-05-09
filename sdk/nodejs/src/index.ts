// import 'core-js/stable'
import 'core-js/actual/set'
import 'core-js/actual/map'
import 'core-js/es/object/values'
import 'core-js/es/object/proto'
import 'core-js/es/object/get-prototype-of'
// import 'core-js/es/object/get-own-property-descriptor'
import 'core-js/es/symbol/iterator'

import { DVCOptions } from './types'
import { DVCClient } from './client'

export { DVCClient }
export { defaultLogger } from './utils/logger'
export * from './types'

export function initialize(
    environmentKey: string,
    options?: DVCOptions
): DVCClient {
    if (!environmentKey) {
        throw new Error(
            'Missing environment key! Call initialize with a valid environment key'
        )
    }

    return new DVCClient(environmentKey, options)
}

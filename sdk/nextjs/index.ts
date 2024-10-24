// Use this file to export React client code (e.g. those with 'use client' directive)
// or other non-server utilities

import { DevCycleNextClient } from './src/client/internal/context'

export { useVariable, useVariableValue } from './src/client/useVariableValue'
export type * from './src/common/types'
export { useUserIdentity } from './src/client/useUserIdentity'
export { useTrack } from './src/client/useTrack'
export { useAllVariables } from './src/client/useAllVariables'
export { useAllFeatures } from './src/client/useAllFeatures'
export { renderIfEnabled } from './src/client/renderIfEnabled'
export { useDevCycleClient } from './src/client/useDevCycleClient'
export { DevCycleClientsideProvider } from './src/client/DevCycleClientsideProvider'
export {
    DVCVariable,
    DVCVariableValue,
    DevCycleJSON,
    DVCCustomDataJSON,
} from '@devcycle/react-client-sdk'

export type DevCycleClient = DevCycleNextClient
export type { DevCycleClient as DevCycleJSClient } from '@devcycle/js-client-sdk'
export type { DevCycleNextClient }

// Use this file to export React client code (e.g. those with 'use client' directive)
// or other non-server utilities
import { DevCycleClient as JSClient } from '@devcycle/js-client-sdk'

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
} from '@devcycle/react-client-sdk'

type DevCycleClient = Omit<JSClient, 'identifyUser' | 'resetUser'>

export type { DevCycleClient }

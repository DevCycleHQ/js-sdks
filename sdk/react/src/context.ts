import { createContext } from 'react'
import type { DevCycleClient } from '@devcycle/devcycle-js-sdk'

interface DevCycleContext {
    client: DevCycleClient
}

const context = createContext<DevCycleContext | undefined>(undefined)
const { Provider, Consumer } = context

export { Provider, Consumer }
export type { DevCycleContext }
export default context

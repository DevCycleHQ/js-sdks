import { createContext } from 'react'
import type { DVCClient } from '@devcycle/devcycle-js-sdk'

interface DVCContext {
    client: DVCClient
}

const context = createContext<DVCContext | undefined>(undefined)
const { Provider, Consumer } = context

export { Provider, Consumer }
export type { DVCContext }
export default context

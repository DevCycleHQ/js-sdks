import { createContext, useContext } from 'react'
import type { DVCClient, DVCVariable } from '@devcycle/devcycle-js-sdk'

interface DVCContext {
  client: DVCClient
}

const context = createContext<DVCContext>(undefined!)

const { Provider, Consumer } = context

export { Provider, Consumer }
export type { DVCContext }
export default context

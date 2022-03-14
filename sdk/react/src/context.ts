import { createContext } from 'react'
import type { DVCClient, DVCVariable } from '@devcycle/devcycle-js-sdk'

interface DVCContext {
  client?: DVCClient,
  variables: { [key: string]: DVCVariable}
}

const context = createContext<DVCContext>({ client: undefined, variables: {} })
const { Provider, Consumer } = context

export { Provider, Consumer }
export type { DVCContext }
export default context

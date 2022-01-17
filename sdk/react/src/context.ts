import { createContext } from 'react'
import { DVCClient } from 'dvc-js-client-sdk'

interface DVCContext {
  client?: DVCClient
}

const context = createContext<DVCContext>({ client: undefined })
const { Provider, Consumer } = context

export { Provider, Consumer, DVCContext }
export default context

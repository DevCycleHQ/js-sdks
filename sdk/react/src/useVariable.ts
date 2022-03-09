import { useContext } from 'react'
import context from './context'
import type { DVCVariable } from '@devcycle/devcycle-js-sdk'

export const useVariable = (key: string, defaultValue: any): DVCVariable => {
  const { client } = useContext(context)
  return client ? client.variable(key, defaultValue) : {
      value: defaultValue,
      defaultValue: defaultValue,
      isDefaulted: true,
      // TODO fix this when variable hook rerendering is finished
      onUpdate: (() => {}) as () => DVCVariable,
      key
  }
}

export default useVariable

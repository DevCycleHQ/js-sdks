import { useContext } from 'react'
import context from './context'
import { DVCVariable } from '@devcycle/devcycle-js-sdk/dist/Variable'

export const useVariable = (key: string, defaultValue: any) => {
  const { client } = useContext(context)
  return client ? client.variable(key, defaultValue) : new DVCVariable({ key, defaultValue, value: null })
}

export default useVariable

import { useContext } from 'react'
import context from './context'

export const useDVCClient = () => {
  const { client } = useContext(context)

  return client
}

export default useDVCClient

import { useContext } from 'react'
import { DevCycleNextClient, DevCycleProviderContext } from './context'

export const useDevCycleClient = (): DevCycleNextClient => {
    return useContext(DevCycleProviderContext).client
}

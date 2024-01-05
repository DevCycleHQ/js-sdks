import { useContext } from 'react'
import { DevCycleProviderContext } from './context'
import { DevCycleClient } from '@devcycle/js-client-sdk'

export const useDevCycleClient = (): DevCycleClient => {
    return useContext(DevCycleProviderContext).client
}

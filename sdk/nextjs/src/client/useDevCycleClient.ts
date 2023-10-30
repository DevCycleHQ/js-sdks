import { useContext } from 'react'
import { DevCycleClientContext } from './DevCycleClientsideProvider'
import { DevCycleClient } from '@devcycle/js-client-sdk'

export const useDevCycleClient = (): DevCycleClient => {
    return useContext(DevCycleClientContext).client
}

import { useContext } from 'react'
import { DevCycleClientContext } from '@devcycle/next-sdk'

export const useDevCycleClient = () => {
    return useContext(DevCycleClientContext).client
}

import { useContext } from 'react'
import { ClientContext } from '@devcycle/next-sdk'

export const useDevCycleClient = () => {
    return useContext(ClientContext)!
}

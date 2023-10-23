'use client'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { createCookieContents } from '../common/cookie'
import { useDevCycleClient } from './useDevCycleClient'
import { updateDVCCookie } from './updateDVCCookie'

export const useIdentifyUser = () => {
    const client = useDevCycleClient()
    return (user: DevCycleUser) => {
        client.identifyUser(user).then(() => {
            console.log('DONE IDENTIFY USER')
            // set coookie
            updateDVCCookie(client)
        })
    }
}

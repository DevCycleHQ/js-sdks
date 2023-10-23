'use client'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { createCookieContents } from '../common/cookie'
import { useDevCycleClient } from './useDevCycleClient'

export const useIdentifyUser = () => {
    const client = useDevCycleClient()
    return (user: DevCycleUser) => {
        client.identifyUser(user).then(() => {
            console.log('REFRESHING FROM USEIDENTIFYUSER')
            // set coookie
            document.cookie =
                'devcycle-next=' +
                createCookieContents({
                    user_id: client.user!.user_id,
                })
        })
    }
}

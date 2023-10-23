'use client'
import { dvcGlobal } from '../common/global'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { createCookieContents } from '../common/cookie'

export const identifyUser = (user: DevCycleUser) => {
    dvcGlobal.devcycleClient.identifyUser(user)
    // set coookie
    document.cookie =
        'devcycle-next=' + createCookieContents(dvcGlobal.devcycleClient.user!)
}

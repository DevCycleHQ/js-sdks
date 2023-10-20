// Use this file to export React server components
import { NextRequest, NextResponse } from 'next/server'
import { cookieName, createCookieContents } from './cookie'
import { getBucketedConfig } from './bucketing'
import { getIdentity, getSDKKey, setIdentity, setSDKKey } from './context'

export const DevCycleMiddleware = (token: string) => {
    return function (request: NextRequest) {
        // const dvcCookie = request.cookies.get(cookieName)
        // if (dvcCookie?.value) {
        //     console.log('VALUE', dvcCookie)
        //     // const data = JSON.parse(dvcCookie.value)
        //     // setIdentity(data.user)
        //     // void getBucketedConfig()
        // }
        // const response = NextResponse.next()
        // const identified = getIdentity()
        // if (identified) {
        //     response.cookies.set(cookieName, createCookieContents(identified))
        // }
    }
}

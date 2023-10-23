// Use this file to export React server components
import { NextRequest, NextResponse } from 'next/server'
import { cookieName, createCookieContents } from '../common/cookie'
import { getIdentity, identifyUser } from '@devcycle/next-sdk/server'

/**
 * Middleware which receives the latest user identity from the client-side SDK and updates the server's representation
 * @param token
 * @constructor
 */
export const DevCycleMiddleware = (token: string) => {
    return async function (request: NextRequest) {
        const dvcCookie = request.cookies.get(cookieName)
        if (dvcCookie?.value) {
            // const data = JSON.parse(dvcCookie.value)
        }
        // const response = NextResponse.next()
        // const identified = getIdentity()
        // if (identified) {
        //     response.cookies.set(cookieName, createCookieContents(identified))
        // }
    }
}

'use server'
import { cookies } from 'next/headers'
import { debugUserCookieName } from '../cookie'

/**
 * Clear the debug user cookie. This is called from the client side
 * to clear the cookie on page refresh.
 */
export const clearDebugUserCookie = async (): Promise<void> => {
    const cookieStore = await cookies()
    cookieStore.set(debugUserCookieName, '', {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        path: '/',
        expires: new Date(0),
    })
}

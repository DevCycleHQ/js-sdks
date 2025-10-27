'use server'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { createCookieContents, cookieName } from './cookie'

export const identifyUser = async (
    sdkToken: string,
    user: DevCycleUser,
    debugMode = false,
): Promise<void> => {
    // Set cookie with user data, marking it as from client
    const cookieStore = await cookies()
    const contents = createCookieContents(user, true, debugMode)
    console.log(`got user on server: ${user}, contents: ${contents}`)
    cookieStore.set(cookieName, contents, {
        httpOnly: false, // Allow client-side access if needed
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        // Short expiration for debug mode, longer for normal usage
        maxAge: debugMode ? 60 * 30 : 60 * 60 * 24 * 7, // 30 min vs 7 days
    })

    // Revalidate caches to trigger fresh bucketing
    if (user.user_id) {
        revalidateTag(user.user_id)
    }
}

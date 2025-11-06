'use server'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { createCookieContents, cookieName } from './cookie'

export const setDebugUser = async (user: DevCycleUser): Promise<void> => {
    // Set cookie with user data, marking it as from client
    const cookieStore = await cookies()
    const contents = createCookieContents(user)
    console.log(`got user on server: ${user}, contents: ${contents}`)
    cookieStore.set(cookieName, contents, {
        httpOnly: true, // Allow client-side access if needed
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    })

    // Revalidate caches to trigger fresh bucketing
    if (user.user_id) {
        revalidateTag(user.user_id)
    }
}

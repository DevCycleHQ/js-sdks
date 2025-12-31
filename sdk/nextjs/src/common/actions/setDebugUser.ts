'use server'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { debugUserCookieName } from '../cookie'

export const setDebugUser = async (user: DevCycleUser): Promise<void> => {
    if (!user.user_id) {
        console.warn('Debug user not set: user_id is required')
        return
    }
    const cookieStore = await cookies()
    cookieStore.set(debugUserCookieName, JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    })

    // Revalidate caches to trigger fresh bucketing
    revalidateTag(user.user_id)
}

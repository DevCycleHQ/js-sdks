'use server'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'

export const COOKIE_NAME = 'devcycle-web-debug-user'

export const setDebugUser = async (user: DevCycleUser): Promise<void> => {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    })

    // Revalidate caches to trigger fresh bucketing
    if (user.user_id) {
        revalidateTag(user.user_id)
    }
}

export const removeDebugUser = async (user_id?: string): Promise<void> => {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
    // Revalidate caches to trigger fresh bucketing
    if (user_id) {
        revalidateTag(user_id)
    }
}

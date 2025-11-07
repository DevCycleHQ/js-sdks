'use server'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { debugUserCookieName } from '../cookie'

export const removeDebugUser = async (user_id?: string): Promise<void> => {
    const cookieStore = await cookies()
    cookieStore.delete(debugUserCookieName)
    // Revalidate caches to trigger fresh bucketing
    if (user_id) {
        revalidateTag(user_id)
    }
}

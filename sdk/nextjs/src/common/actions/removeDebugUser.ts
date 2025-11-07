'use server'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'
import { debugUserCookieName } from '../cookie'
import { DevCycleUser } from '@devcycle/js-client-sdk'

export const removeDebugUser = async (user: DevCycleUser): Promise<void> => {
    const cookieStore = await cookies()
    cookieStore.delete(debugUserCookieName)
    // Revalidate caches to trigger fresh bucketing
    if (user.user_id) {
        revalidateTag(user.user_id)
    }
}

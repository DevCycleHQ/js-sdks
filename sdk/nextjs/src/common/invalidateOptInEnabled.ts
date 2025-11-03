'use server'
import { revalidateTag } from 'next/cache'

export const invalidateOptInEnabled = async (sdkKey: string): Promise<void> => {
    if (typeof window != 'undefined') {
        console.warn('Error invalidating opt in enabled')
        return
    }
    revalidateTag(`optin-${sdkKey}`)
}

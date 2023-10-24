'use server'
import { revalidateTag } from 'next/cache'

export const invalidateConfig = async (sdkToken: string) => {
    revalidateTag(sdkToken)
}

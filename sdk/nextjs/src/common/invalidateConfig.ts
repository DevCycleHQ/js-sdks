'use server'
import { invalidateConfigCache } from '../server/requests'

export const invalidateConfig = async (
    sdkToken: string,
    lastModified?: number,
) => {
    await invalidateConfigCache(sdkToken, lastModified)
}

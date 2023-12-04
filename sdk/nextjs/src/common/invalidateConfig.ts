'use server'
import { invalidateConfigCache } from '../server/requests'

export const invalidateConfig = async (
    sdkToken: string,
    lastModified?: number,
): Promise<void> => {
    await invalidateConfigCache(sdkToken, lastModified)
}

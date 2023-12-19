'use server'
import { fetchCDNConfig } from '../server/requests'
import { revalidateTag } from 'next/cache'

export const invalidateConfig = async (
    sdkToken: string,
    lastModified?: number,
): Promise<void> => {
    await invalidateConfigCache(sdkToken, lastModified)
}

export const invalidateConfigCache = async (
    sdkKey: string,
    lastModified?: number,
): Promise<void> => {
    const response = await fetchCDNConfig(sdkKey)

    const lastModifiedHeader = response.headers.get('last-modified')

    const lastModifiedCache = new Date(lastModifiedHeader ?? 0)
    const lastModifiedClient = new Date(lastModified ?? 0)

    if (
        lastModifiedHeader &&
        lastModified &&
        lastModifiedClient > lastModifiedCache
    ) {
        console.log('Invalidating old cached config')
        revalidateTag(sdkKey)
    }
}

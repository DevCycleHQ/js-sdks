'use server'
import { fetchCDNConfig } from '../server/requests'
import { revalidateTag } from 'next/cache'

export const invalidateConfig = async (
    sdkToken: string,
    obfuscated: boolean,
    lastModified?: number,
): Promise<void> => {
    if (typeof window != 'undefined') {
        console.error(
            'DevCycle realtime updates are only available in Next.js 14.0.5 and above. Please update your version ' +
                'or disable realtime updates.',
        )
        return
    }
    await invalidateConfigCache(sdkToken, obfuscated, lastModified)
}

export const invalidateConfigCache = async (
    sdkKey: string,
    obfuscated: boolean,
    lastModified?: number,
): Promise<void> => {
    const response = await fetchCDNConfig(sdkKey, {
        enableObfuscation: obfuscated,
    })

    const lastModifiedHeader = response.headers.get('last-modified')

    const lastModifiedCache = new Date(lastModifiedHeader ?? 0)
    const lastModifiedClient = new Date(lastModified ?? 0)

    if (
        lastModifiedHeader &&
        lastModified &&
        lastModifiedClient > lastModifiedCache
    ) {
        console.log('Invalidating old DevCycle cached config')
        revalidateTag(sdkKey)
    }
}

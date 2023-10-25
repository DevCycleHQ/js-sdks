import { getSDKKey } from './requestContext'
import { revalidateTag } from 'next/cache'

const getFetchUrl = (sdkKey?: string) =>
    `https://config-cdn.devcycle.com/config/v1/client/${
        sdkKey ?? getSDKKey()
    }.json`

export const fetchCDNConfig = async (sdkKey?: string) => {
    return await fetch(
        getFetchUrl(sdkKey),
        // only store for 60 seconds
        {
            next: {
                revalidate: 60,
                tags: [sdkKey ?? getSDKKey()],
            },
        },
    )
}

export const invalidateConfigCache = async (
    sdkKey: string,
    lastModified?: number,
) => {
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

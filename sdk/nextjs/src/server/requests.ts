import { getSDKKey } from './requestContext'

const getFetchUrl = () =>
    `https://config-cdn.devcycle.com/config/v1/client/${getSDKKey()}.json`

export const fetchCDNConfig = async (lastModified?: string) => {
    const response = await fetch(
        getFetchUrl(),
        // only store for 30 seconds, or force revalidate
        {
            next: {
                revalidate: 30,
                tags: [getSDKKey()],
            },
        },
    )

    const lastModifiedHeader = response.headers.get('last-modified')

    const lastModifiedCache = new Date(lastModifiedHeader ?? 0)
    const lastModifiedClient = new Date(lastModified ?? 0)

    if (
        lastModifiedHeader &&
        lastModified &&
        lastModifiedClient > lastModifiedCache
    ) {
        console.log('REFETCHING NO CACHE')
        return await fetch(
            getFetchUrl(),
            // force revalidate when client has newer config
            { next: { revalidate: 0, tags: [getSDKKey()] } },
        )
    } else {
        // otherwise use cached response
        return response
    }
}

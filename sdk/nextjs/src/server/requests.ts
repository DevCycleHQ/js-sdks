import { getSDKKey } from './requestContext'

const getFetchUrl = () =>
    `https://config-cdn.devcycle.com/config/v1/client/${getSDKKey()}.json`

export const fetchCDNConfig = async () => {
    return await fetch(
        getFetchUrl(),
        // only store for 30 seconds, or force revalidate
        {
            next: {
                revalidate: 30,
                tags: [getSDKKey()],
            },
        },
    )
}

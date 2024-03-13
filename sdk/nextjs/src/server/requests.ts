import { DevCycleNextOptions } from '../common/types'

const getFetchUrl = (sdkKey: string, obfuscated: boolean) =>
    `https://config-cdn.devcycle.com/config/v1/client/${
        obfuscated ? 'obfuscated/' : ''
    }${sdkKey}.json`

export const fetchCDNConfig = async (
    sdkKey: string,
    options: DevCycleNextOptions,
): Promise<Response> => {
    return await fetch(
        getFetchUrl(sdkKey, !!options.enableObfuscation),
        // only store for 60 seconds
        {
            next: {
                revalidate: 60,
                tags: [sdkKey],
            },
        },
    )
}

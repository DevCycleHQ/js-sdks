const getFetchUrl = (sdkKey: string, obfuscated: boolean) =>
    `https://config-cdn.devcycle.com/config/v1/server/bootstrap/${
        obfuscated ? 'obfuscated/' : ''
    }${sdkKey}.json`

export const fetchCDNConfig = async (
    sdkKey: string,
    clientSDKKey: string,
    obfuscated: boolean,
): Promise<Response> => {
    return await fetch(
        getFetchUrl(sdkKey, obfuscated),
        // only store for 60 seconds
        {
            next: {
                revalidate: 60,
                tags: [sdkKey, clientSDKKey],
            },
        },
    )
}

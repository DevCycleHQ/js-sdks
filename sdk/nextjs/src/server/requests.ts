const getFetchUrl = (sdkKey: string) =>
    `https://config-cdn.devcycle.com/config/v1/client/${sdkKey}.json`

export const fetchCDNConfig = async (sdkKey: string): Promise<Response> => {
    return await fetch(
        getFetchUrl(sdkKey),
        // only store for 60 seconds
        {
            next: {
                revalidate: 60,
                tags: [sdkKey],
            },
        },
    )
}

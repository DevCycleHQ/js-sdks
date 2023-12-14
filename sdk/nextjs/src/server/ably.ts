import { unstable_cache } from 'next/cache.js'

const sha1 = async (str: string, subtle: SubtleCrypto) => {
    const source = new TextEncoder().encode(str)
    const result = await subtle.digest(
        {
            name: 'SHA-1',
        },
        source,
    )

    return Array.from(new Uint8Array(result))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

const getChannelName = async (key: string, subtle: SubtleCrypto) => {
    return `dvc_client_${await sha1(`${key}`, subtle)}_v1`
}

export const sseURlGetter = (
    sdkKey: string,
    apiKey: string,
): (() => Promise<string>) => {
    return unstable_cache(async () => {
        const subtle = crypto.subtle
        const channels = await getChannelName(sdkKey, subtle)

        const SSEBaseUrl = 'https://realtime.ably.io/event-stream'
        return `${SSEBaseUrl}?channels=${channels}&v=1.2&key=${apiKey}`
    }, [sdkKey, apiKey])
}

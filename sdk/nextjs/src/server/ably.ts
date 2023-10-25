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

export const getChannelName = async (key: string, subtle: SubtleCrypto) => {
    return `dvc_client_${await sha1(`${key}`, subtle)}_v1`
}

export const getUserChannelName = async (
    userId: string,
    subtle: SubtleCrypto,
) => {
    return `dvc_user_${await sha1(`${userId}`, subtle)}_v1`
}

export async function getSSEUrl(
    sdkKey: string,
    apiKey: string,
    debugUserId?: string,
) {
    const subtle = crypto.subtle
    const projectChannel = await getChannelName(sdkKey, subtle)
    const channels = debugUserId
        ? `${await getUserChannelName(debugUserId, subtle)},${projectChannel}`
        : projectChannel

    const SSEBaseUrl = 'https://realtime.ably.io/event-stream'
    return `${SSEBaseUrl}?channels=${channels}&v=1.2&key=${apiKey}`
}

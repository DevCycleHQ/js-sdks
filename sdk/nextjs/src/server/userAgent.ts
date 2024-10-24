import { headers } from 'next/headers'
import { DevCycleNextOptions } from '../common/types'

export const getUserAgent = async (
    options: DevCycleNextOptions,
): Promise<string | undefined> => {
    if (options.staticMode) {
        return
    }

    const reqHeaders = await headers()
    return reqHeaders.get('user-agent') ?? undefined
}

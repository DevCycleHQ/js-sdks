import { headers } from 'next/headers'
import { DevCycleNextOptions } from '../common/types'

export const getUserAgent = (
    options: DevCycleNextOptions,
): string | undefined => {
    if (options.staticMode) {
        return
    }

    const reqHeaders = headers()
    return reqHeaders.get('user-agent') ?? undefined
}

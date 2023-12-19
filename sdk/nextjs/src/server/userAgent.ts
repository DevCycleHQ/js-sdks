import { asyncStorageError, getOptions } from './requestContext'
import { headers } from 'next/headers'

export const getUserAgent = (): string | undefined => {
    const options = getOptions()

    if (!options) {
        throw asyncStorageError()
    }

    if (options.staticMode) {
        return
    }

    const reqHeaders = headers()
    return reqHeaders.get('user-agent') ?? undefined
}

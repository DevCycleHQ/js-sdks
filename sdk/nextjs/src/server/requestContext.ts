import { DevCycleClient } from '@devcycle/js-client-sdk'
import { cache } from 'react'

export const requestContext = <T>(
    defaultValue: T,
): [() => T, (v: T) => void] => {
    const getRef = cache(() => ({ current: defaultValue }))

    const getValue = (): T => getRef().current

    const setValue = (value: T) => {
        getRef().current = value
    }

    return [getValue, setValue]
}

export const [getClient, setClient] = requestContext<
    DevCycleClient | undefined
>(undefined)

export const cacheStorageError = (): Error => {
    return new Error(
        'React cache API is not working as expected. Please contact DevCycle support.',
    )
}

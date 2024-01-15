import { DevCycleClient, DevCycleUser } from '@devcycle/js-client-sdk'
import { initialize } from './initialize'
import { cache } from 'react'
import { DevCycleNextOptions } from '../common/types'

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

export const [getIdentity, setIdentity] = requestContext<
    DevCycleUser | undefined
>(undefined)

export const [getClient, setClient] = requestContext<
    DevCycleClient | undefined
>(undefined)

const [_getSDKKey, _setSDKKey] = requestContext<string | undefined>(undefined)

export const getSDKKey = (): string => {
    const key = _getSDKKey()
    if (!key) {
        throw new Error('SDK Client Key must be set!')
    }
    return key
}

export const setSDKKey = (key: string): void => {
    if (!key) {
        throw new Error(
            'Missing SDK key! Provide a valid SDK key to DevCycleServersideProvider',
        )
    }

    // attempt to make sure server keys don't leak to the client!
    if (
        key?.length &&
        !key.startsWith('dvc_client') &&
        !key.startsWith('client')
    ) {
        throw new Error(
            'Must use a client SDK key. This key will be sent to the client!',
        )
    }
    _setSDKKey(key)
}

const [_getInitializedPromise, _setInitializedPromise] = requestContext<
    ReturnType<typeof initialize> | undefined
>(undefined)

export const getInitializedPromise = _getInitializedPromise

export const setInitializedPromise = (
    promise: ReturnType<typeof initialize>,
): void => {
    if (_getInitializedPromise()) {
        return
    }
    _setInitializedPromise(promise)
}

export const [getOptions, setOptions] = requestContext<DevCycleNextOptions>({})

export const cacheStorageError = (): Error => {
    return new Error(
        'React cache API is not working as expected. Please contact DevCycle support.',
    )
}

import { cache } from 'react'
import { DevCycleClient, DevCycleUser } from '@devcycle/js-client-sdk'

export const context = <T>(
    defaultValue: T,
    namespace: string,
): [() => T, (v: T) => void] => {
    const getRef = cache((namespace: string) => ({ current: defaultValue }))

    const getValue = (): T => getRef(namespace).current

    const setValue = (value: T) => {
        getRef(namespace).current = value
    }

    return [getValue, setValue]
}

export const [getIdentity, setIdentity] = context<DevCycleUser | undefined>(
    undefined,
    'user',
)

const [_getSDKKey, _setSDKKey] = context<string | undefined>(
    undefined,
    'sdkKey',
)

export const [getClient, setClient] = context<DevCycleClient | undefined>(
    undefined,
    'client',
)

export const getSDKKey = () => {
    const key = _getSDKKey()
    if (!key) {
        throw new Error('SDK Client Key must be set!')
    }
    return key
}

export const setSDKKey = (key: string) => {
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

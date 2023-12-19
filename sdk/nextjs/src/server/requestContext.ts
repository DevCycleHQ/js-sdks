import { DevCycleClient, DevCycleUser } from '@devcycle/js-client-sdk'
import { DevCycleNextOptions, initialize } from './initialize'
import { AsyncLocalStorage } from 'node:async_hooks'

type Storage = {
    identity?: DevCycleUser
    client?: DevCycleClient
    options?: DevCycleNextOptions
    initializedPromise?: ReturnType<typeof initialize>
    sdkKey?: string
}

export const requestContext = new AsyncLocalStorage<Storage>()

const createAccessors = <T extends keyof Storage>(
    key: T,
): [() => Storage[T], (value: Storage[T]) => void] => {
    return [
        (): Storage[T] | undefined => {
            const storage = requestContext.getStore()
            if (!storage) {
                throw new Error(
                    '[DevCycle] Request context not initialized. Please contact DevCycle support.',
                )
            }
            return storage[key]
        },
        (value: Storage[T]): void => {
            const storage = requestContext.getStore()
            if (!storage) {
                throw new Error(
                    '[DevCycle] Request context not initialized. Please contact DevCycle support.',
                )
            }
            storage[key] = value
        },
    ]
}

// export const requestContext = <T>(
//     defaultValue: T,
// ): [() => T, (v: T) => void] => {
//     const getRef = cache(() => ({ current: defaultValue }))
//
//     const getValue = (): T => getRef().current
//
//     const setValue = (value: T) => {
//         getRef().current = value
//     }
//
//     return [getValue, setValue]
// }

export const [getIdentity, setIdentity] = createAccessors('identity')

export const [getClient, setClient] = createAccessors('client')

const [_getSDKKey, _setSDKKey] = createAccessors('sdkKey')

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

const [_getInitializedPromise, _setInitializedPromise] =
    createAccessors('initializedPromise')

export const getInitializedPromise = _getInitializedPromise

export const setInitializedPromise = (
    promise: ReturnType<typeof initialize>,
): void => {
    if (_getInitializedPromise()) {
        return
    }
    _setInitializedPromise(promise)
}

export const [getOptions, setOptions] = createAccessors('options')

export const asyncStorageError = (): Error => {
    return new Error(
        'AsyncLocalStorage is not working as expected. Please contact DevCycle support.',
    )
}

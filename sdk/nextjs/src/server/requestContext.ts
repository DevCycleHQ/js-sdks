import { cache } from 'react'
import {
    DevCycleClient,
    DevCycleEvent,
    DevCycleUser,
} from '@devcycle/js-client-sdk'
import { DevCycleNextOptions, initialize } from './initialize'
import {
    DevCycleServersideProvider,
    DevCycleServersideProviderProps,
} from '@devcycle/next-sdk/server'

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

export const getSDKKey = () => {
    const key = _getSDKKey()
    if (!key) {
        throw new Error('SDK Client Key must be set!')
    }
    return key
}

export const setSDKKey = (key: string) => {
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

const [_getTrackedEvents, _setTrackedEvents] = requestContext<DevCycleEvent[]>(
    [],
)

export const addTrackedEvent = (event: DevCycleEvent) => {
    const metaData = {
        ...event.metaData,
        serverside: true,
    }
    _setTrackedEvents([
        ..._getTrackedEvents(),
        { date: Date.now(), ...event, metaData },
    ])
}

export const getTrackedEvents = () => _getTrackedEvents()

const [_getInitializedPromise, _setInitializedPromise] = requestContext<
    ReturnType<typeof initialize> | undefined
>(undefined)

export const getInitializedPromise = _getInitializedPromise

export const setInitializedPromise = (
    promise: ReturnType<typeof initialize>,
) => {
    if (_getInitializedPromise()) {
        return
    }
    _setInitializedPromise(promise)
}

export const [getOptions, setOptions] = requestContext<DevCycleNextOptions>({})

import { getVariableValue } from './getVariableValue'
import {
    getInitializedPromise,
    getIdentity,
    setInitializedPromise,
} from './requestContext'
import { DevCycleNextOptions, initialize, setupContext } from './initialize'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getUserAgent } from './userAgent'

// server-side users must always be "identified" with a user id
type ServerUser = Omit<DevCycleUser, 'user_id' | 'isAnonymous'> & {
    user_id: string
}

const ensureSetup = async (
    sdkKey: string,
    userGetter: () => Promise<ServerUser> | ServerUser,
    options: DevCycleNextOptions,
) => {
    const initializedPromise = getInitializedPromise()
    if (!initializedPromise) {
        const user = await userGetter()
        if (!user || typeof user.user_id !== 'string') {
            throw new Error('DevCycle user getter must return a user')
        }

        setupContext(sdkKey, await userGetter(), options)
        const serverDataPromise = initialize()
        setInitializedPromise(serverDataPromise)

        return { serverDataPromise }
    }

    return { serverDataPromise: initializedPromise }
}

// allow return type inference
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setupDevCycle = (
    sdkKey: string,
    userGetter: () => Promise<ServerUser> | ServerUser,
    options: DevCycleNextOptions = {},
) => {
    const _getVariableValue: typeof getVariableValue = async (
        key,
        defaultValue,
    ) => {
        await ensureSetup(sdkKey, userGetter, options)
        return getVariableValue(key, defaultValue)
    }

    const _getClientContext = async () => {
        const { serverDataPromise } = await ensureSetup(
            sdkKey,
            userGetter,
            options,
        )

        const user = getIdentity()

        if (!user) {
            throw new Error(
                'DevCycle failed to initialize correctly. Please contact support.',
            )
        }

        return {
            serverDataPromise,
            serverData: options?.enableStreaming
                ? undefined
                : await serverDataPromise,
            sdkKey: sdkKey,
            user: user,
            enableStreaming: options?.enableStreaming ?? false,
            userAgent: getUserAgent(),
        }
    }

    return {
        getVariableValue: _getVariableValue,
        getClientContext: _getClientContext,
    }
}

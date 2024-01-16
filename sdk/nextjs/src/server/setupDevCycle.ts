import { getVariableValue } from './getVariableValue'
import { initialize, validateSDKKey } from './initialize'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getUserAgent } from './userAgent'
import { getAllVariables } from './getAllVariables'
import { getAllFeatures } from './allFeatures'
import { DevCycleNextOptions } from '../common/types'

// server-side users must always be "identified" with a user id
type ServerUser = Omit<DevCycleUser, 'user_id' | 'isAnonymous'> & {
    user_id: string
}

// allow return type inference
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setupDevCycle = (
    sdkKey: string,
    userGetter: () => Promise<ServerUser> | ServerUser,
    options: DevCycleNextOptions = {},
) => {
    validateSDKKey(sdkKey)

    const _getVariableValue: typeof getVariableValue = async (
        key,
        defaultValue,
    ) => {
        await initialize(sdkKey, userGetter, options)
        return getVariableValue(key, defaultValue)
    }

    const _getAllVariables: typeof getAllVariables = async () => {
        await initialize(sdkKey, userGetter, options)
        return getAllVariables()
    }

    const _getAllFeatures: typeof getAllFeatures = async () => {
        await initialize(sdkKey, userGetter, options)
        return getAllFeatures()
    }

    const _getClientContext = () => {
        const serverDataPromise = initialize(sdkKey, userGetter, options)

        const { enableStreaming, ...otherOptions } = options

        const {
            disableAutomaticEventLogging,
            disableCustomEventLogging,
            disableRealtimeUpdates,
            apiProxyURL,
            eventFlushIntervalMS,
            flushEventQueueSize,
        } = otherOptions

        const clientOptions = {
            disableAutomaticEventLogging,
            disableCustomEventLogging,
            disableRealtimeUpdates,
            apiProxyURL,
            eventFlushIntervalMS,
            flushEventQueueSize,
        }

        return {
            serverDataPromise,
            sdkKey: sdkKey,
            options: clientOptions,
            enableStreaming: options?.enableStreaming ?? false,
            userAgent: getUserAgent(options),
        }
    }

    return {
        getVariableValue: _getVariableValue,
        getAllVariables: _getAllVariables,
        getAllFeatures: _getAllFeatures,
        getClientContext: _getClientContext,
    }
}

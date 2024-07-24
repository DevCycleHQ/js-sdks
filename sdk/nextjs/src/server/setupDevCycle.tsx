import 'server-only'
import { getVariableValue } from './getVariableValue'
import { initialize, validateSDKKey } from './initialize'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { getUserAgent } from './userAgent'
import { getAllVariables } from './getAllVariables'
import { getAllFeatures } from './allFeatures'
import { DevCycleNextOptions } from '../common/types'
import { getProjectConfig } from './bucketing'

// server-side users must always be "identified" with a user id
type ServerUser = Omit<DevCycleUser, 'user_id' | 'isAnonymous'> & {
    user_id: string
}

// allow return type inference
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setupDevCycle = ({
    serverSDKKey,
    clientSDKKey,
    userGetter,
    options = {},
}: {
    serverSDKKey: string
    clientSDKKey: string
    userGetter: () => Promise<ServerUser> | ServerUser
    options?: DevCycleNextOptions
}) => {
    validateSDKKey(serverSDKKey, 'server')
    validateSDKKey(clientSDKKey, 'client')

    const _getVariableValue: typeof getVariableValue = async (
        key,
        defaultValue,
    ) => {
        await initialize(serverSDKKey, clientSDKKey, userGetter, options)
        return getVariableValue(key, defaultValue)
    }

    const _getAllVariables: typeof getAllVariables = async () => {
        await initialize(serverSDKKey, clientSDKKey, userGetter, options)
        return getAllVariables()
    }

    const _getAllFeatures: typeof getAllFeatures = async () => {
        await initialize(serverSDKKey, clientSDKKey, userGetter, options)
        return getAllFeatures()
    }

    const _getConfig = async () => {
        return getProjectConfig(serverSDKKey, clientSDKKey, options)
    }

    const _getClientContext = () => {
        const serverDataPromise = initialize(
            serverSDKKey,
            clientSDKKey,
            userGetter,
            options,
        )

        const { enableStreaming, enableObfuscation, ...otherOptions } = options

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
            enableObfuscation,
        }

        return {
            serverDataPromise,
            options: clientOptions,
            clientSDKKey: clientSDKKey,
            enableStreaming: options?.enableStreaming ?? false,
            userAgent: getUserAgent(options),
        }
    }

    return {
        getVariableValue: _getVariableValue,
        getAllVariables: _getAllVariables,
        getAllFeatures: _getAllFeatures,
        getClientContext: _getClientContext,
        getConfig: _getConfig,
    }
}

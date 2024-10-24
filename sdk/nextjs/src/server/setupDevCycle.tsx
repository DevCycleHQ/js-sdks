import 'server-only'
import { getVariableValue } from './getVariableValue'
import { initialize, validateSDKKey } from './initialize'
import { DevCycleUser, DVCCustomDataJSON } from '@devcycle/js-client-sdk'
import { getAllVariables } from './getAllVariables'
import { getAllFeatures } from './allFeatures'
import { DevCycleNextOptions } from '../common/types'

// server-side users must always be "identified" with a user id
type ServerUser<CustomData extends DVCCustomDataJSON = DVCCustomDataJSON> =
    Omit<DevCycleUser<CustomData>, 'user_id' | 'isAnonymous'> & {
        user_id: string
    }

// allow return type inference
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setupDevCycle = <
    CustomData extends DVCCustomDataJSON = DVCCustomDataJSON,
>({
    serverSDKKey,
    clientSDKKey,
    userGetter,
    options = {},
}: {
    serverSDKKey: string
    clientSDKKey: string
    userGetter: () => Promise<ServerUser<CustomData>> | ServerUser<CustomData>
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
            // if a custom config source is set, add an artificial delay for realtime updates as a clumsy way to
            // allow for propagation time of the custom source, since we don't have a first-class way to ensure its
            // up to date
            realtimeDelay: options?.configSource ? 10000 : undefined,
        }
    }

    return {
        getVariableValue: _getVariableValue,
        getAllVariables: _getAllVariables,
        getAllFeatures: _getAllFeatures,
        getClientContext: _getClientContext,
    }
}

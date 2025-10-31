import 'server-only'
import { initialize, validateSDKKey } from './initialize'
import {
    DevCycleClient,
    DevCycleEvent,
    DevCycleUser,
    DVCCustomDataJSON,
    VariableDefinitions,
} from '@devcycle/js-client-sdk'
import { DevCycleNextOptions } from '../common/types'
import { InferredVariableType, VariableKey } from '@devcycle/types'
import { cache } from 'react'
import { after } from 'next/server'

// server-side users must always be "identified" with a user id
type ServerUser<CustomData extends DVCCustomDataJSON = DVCCustomDataJSON> =
    Omit<DevCycleUser<CustomData>, 'user_id' | 'isAnonymous'> & {
        user_id: string
    }

type GetVariableValue = <
    K extends VariableKey,
    ValueType extends VariableDefinitions[K],
>(
    key: K,
    defaultValue: ValueType,
) => Promise<InferredVariableType<K, ValueType>>

// queue flush events once after response complete
const cachedFlushEvents = cache((client: DevCycleClient) => {
    try {
        after(async () => {
            await client.flushEvents()
        })
    } catch (error) {
        client.logger.error(
            'Event logging not supported in this environment. Disable automatic event logging in sdk options',
        )
    }
})

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

    const _getVariableValue: GetVariableValue = async (key, defaultValue) => {
        const { client } = await initialize(
            serverSDKKey,
            clientSDKKey,
            userGetter,
            options,
        )

        if (!options.disableAutomaticEventLogging) {
            cachedFlushEvents(client)
        }
        return client.variableValue(key, defaultValue)
    }

    const _getAllVariables = async () => {
        const { client } = await initialize(
            serverSDKKey,
            clientSDKKey,
            userGetter,
            options,
        )
        return client.allVariables()
    }

    const _getAllFeatures = async () => {
        const { client } = await initialize(
            serverSDKKey,
            clientSDKKey,
            userGetter,
            options,
        )
        return client.allFeatures()
    }

    const _track = async (event: DevCycleEvent) => {
        const { client } = await initialize(
            serverSDKKey,
            clientSDKKey,
            userGetter,
            options,
        )
        if (!options.disableCustomEventLogging) {
            cachedFlushEvents(client)
        }
        return client.track(event)
    }

    const _getClientContext = () => {
        const serverDataPromise = initialize(
            serverSDKKey,
            clientSDKKey,
            userGetter,
            options,
        ).then((result) => {
            const { client, ...serverData } = result
            return serverData
        })

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
        track: _track,
    }
}

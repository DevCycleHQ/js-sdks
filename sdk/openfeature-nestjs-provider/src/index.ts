import { DevCycleServerSDKOptions, VariableDefinitions } from '@devcycle/types'
import {
    initializeDevCycle as originalInitialize,
    DevCycleClient,
    DevCycleCloudClient,
} from '@devcycle/nodejs-server-sdk'

// Re-export everything from the nodejs-server-sdk
export * from '@devcycle/nodejs-server-sdk'

/**
 * Initialize DevCycle with NestJS-specific platform settings
 */
export function initializeDevCycle<
    Variables extends VariableDefinitions = VariableDefinitions,
>(
    sdkKey: string,
    options: DevCycleServerSDKOptions = {},
): DevCycleClient<Variables> | DevCycleCloudClient<Variables> {
    return originalInitialize(sdkKey, { ...options, sdkPlatform: 'nestjs-of' })
}

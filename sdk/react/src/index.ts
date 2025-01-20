import asyncWithDVCProvider from './asyncDVCProvider'
import { useDevCycleClient, useDVCClient } from './useDevCycleClient'
import useVariable from './useVariable'
import useVariableValue from './useVariableValue'
import { withDevCycleProvider, withDVCProvider } from './withDevCycleProvider'
import { DevCycleProvider, DVCProvider } from './DevCycleProvider'
import useDVCVariable from './useDVCVariable'
import {
    useIsDevCycleInitialized,
    useIsDVCInitialized,
} from './useIsDevCycleInitialized'
export type {
    DevCycleClient,
    DVCClient,
    DevCycleUser,
    DVCUser,
    DVCVariableValue,
    DVCVariable,
    DVCCustomDataJSON,
    DevCycleJSON,
    DevCycleEvent,
    DevCycleOptions,
    DVCEvent,
} from '@devcycle/js-client-sdk'

export * from './RenderIfEnabled'
export * from './SwapComponents'

export {
    DevCycleProvider,
    DVCProvider,
    useDevCycleClient,
    useDVCClient,
    useVariable,
    useVariableValue,
    useDVCVariable,
    asyncWithDVCProvider,
    withDevCycleProvider,
    withDVCProvider,
    useIsDevCycleInitialized,
    useIsDVCInitialized,
}

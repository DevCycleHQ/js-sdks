'use client'
import { createContext } from 'react'
import type { DevCycleClient } from '@devcycle/js-client-sdk'

interface DevCycleContext {
    client: DevCycleClient
}

const context = createContext<DevCycleContext | undefined>(undefined)
const { Provider, Consumer } = context

export { Provider, Consumer }
export type { DevCycleContext }
export default context

export type InitializedContext = {
    isInitialized: boolean
}
export const initializedContext = createContext<InitializedContext>({
    isInitialized: false,
})

export type DebugContext = {
    showConditionalBorders: boolean
    borderColor: string
}

export const debugContextDefaults: DebugContext = {
    showConditionalBorders: false,
    borderColor: '#ff6347',
}

export const debugContext = createContext<DebugContext>(debugContextDefaults)

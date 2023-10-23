import { DevCycleClient } from '@devcycle/js-client-sdk'

export const dvcGlobal = globalThis as typeof globalThis & {
    devcycleClient: DevCycleClient
}

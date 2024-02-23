import { DevCycleUser, DVCVariable } from '@devcycle/js-client-sdk'
import { BucketedUserConfig } from '@devcycle/types'

export type LiveEvent = {
    type: 'variableEvaluated' | 'variableUpdated' | 'configUpdated'
    key?: string
    variable?: DVCVariable<any> | null
}

export type DebuggerData = {
    liveEvents: LiveEvent[]
    config: BucketedUserConfig
    user: DevCycleUser
}

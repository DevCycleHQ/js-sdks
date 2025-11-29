import { BucketedUserConfig } from '@devcycle/types'
import {
    DevCycleEvent,
    DevCycleUser,
    DVCFeatureSet,
    DVCVariableSet,
} from '@devcycle/js-client-sdk'
import { GetVariableValue } from '../common/types'

export type SSRProps = {
    _devcycleSSR: {
        bucketedConfig: BucketedUserConfig | null
        user: DevCycleUser
        sdkKey: string
        userAgent: string | null
    }
}

export type DevCycleServerInstance = {
    getVariableValue: GetVariableValue
    getAllVariables: () => Promise<DVCVariableSet>
    getAllFeatures: () => Promise<DVCFeatureSet>
    track: (event: DevCycleEvent) => void
    getSSRProps: () => SSRProps
}

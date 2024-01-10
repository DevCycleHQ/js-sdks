import { BucketedUserConfig } from '@devcycle/types'
import { DevCycleUser } from '@devcycle/js-client-sdk'

export type SSRProps = {
    _devcycleSSR: {
        bucketedConfig: BucketedUserConfig | null
        user: DevCycleUser
        sdkKey: string
        userAgent: string | null
    }
}

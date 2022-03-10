// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BucketedUserConfig, ConfigBody } from '@devcycle/types'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { generateBucketedConfig } from '@devcycle/bucketing'
import { DVCUser } from '../../types'

export function bucketUserForConfig(user: DVCUser, config?: ConfigBody): BucketedUserConfig | undefined {
    if (!config) return

    return generateBucketedConfig({ config, user })
}

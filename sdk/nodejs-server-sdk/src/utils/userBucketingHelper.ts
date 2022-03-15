import { BucketedUserConfig, ConfigBody } from '@devcycle/types'
import { generateBucketedConfig } from '@devcycle/bucketing'
import { DVCPopulatedUser } from '../models/populatedUser'

export function bucketUserForConfig(user: DVCPopulatedUser, config?: ConfigBody): BucketedUserConfig | undefined {
    if (!config) return

    return generateBucketedConfig({ config, user })
}

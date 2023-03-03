import { BucketedUserConfig } from '@devcycle/types'
import { DVCPopulatedUser } from '../models/populatedUser'
import { getBucketingLib } from '../bucketing'

export function bucketUserForConfig(user: DVCPopulatedUser, token: string): BucketedUserConfig {
    return JSON.parse(
        getBucketingLib().generateBucketedConfigForUser(token, JSON.stringify(user))
    ) as BucketedUserConfig
}

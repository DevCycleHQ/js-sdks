import { Audience } from './audience'
import { Type } from 'class-transformer'

export class RolloutStage {
    /**
     * Defines the transition into this percentage level.
     */
    type: 'linear' | 'discrete'

    /**
     * Date the target percentage below should be fully applied.
     */
    @Type(() => Date)
        date: Date

    /**
     * Target percentage this step should reach by the above date.
     */
    percentage: number
}

/**
 * Defines rollout configuration for a Target.
 */
export class Rollout {
    /**
     * Type of rollout
     */
    type: 'schedule' | 'gradual' | 'stepped'

    /**
      * Rollout start percentage
      */
    startPercentage?: number

     /**
      * Date to start rollout
      */
     @Type(() => Date)
         startDate: Date

     /**
      * Stages of rollout
      */
     @Type(() => RolloutStage)
         stages?: RolloutStage[]
}

export class TargetDistribution<IdType = string> {
    /**
     * Variation _id from `feature.variations`
     */
    _variation: IdType

    /**
     * Distribution percentage for the variation
     */
    percentage: number
}

/**
 * Defines an Audience Target including the Audience model, rollout, and variation distribution
 * _id needed as it will be used as the seed in the hashing function to determine a given users position
 * in the bucketing and rollout
 */
export class Target<IdType = string> {
    _id: IdType

    /**
     * Audience model describing target segmentation.
     */
    _audience: Audience

    /**
     * Rollout sub-document describing how a Target's audience is rolled out
     */
    @Type(() => Rollout)
        rollout?: Rollout

    /**
     * Specifies variation distribution percentages for features
     */
    distribution: TargetDistribution<IdType>[]
}

export class FeaturePrerequisites<IdType = string> {
    _feature: IdType

    comparator: '=' | '!='
}

export class FeatureWinningVariation<IdType = string> {
    _variation: IdType

    updatedAt: Date
}

/**
 * Feature Configuration Model. Defines the Environment-level model for a given feature.
 */

export class FeatureConfiguration<IdType = string> {
    /**
     * Mongo primary _id.
     */
    _id: IdType

    /**
     * **Implement Later**
     *
     * Defines pre-requisite features that can describe that a user must or must not
     * be bucketed into another feature to be allowed to be bucketed into this feature.
     *
     * Pre-requisites are evaluated before `_winningVariation`,  `forcedUsers`, and `targets`.
     */
    prerequisites?: FeaturePrerequisites<IdType>[]

    /**
     * **Implement Later**
     *
     * Defines the winning variation delivered to all users.
     * Evaluated before `forcedUsers` and `targets`.
     */
    winningVariation?: FeatureWinningVariation<IdType>

    /**
     * **Implement Later**
     * Map of `user_id` to `_variation`
     * Defines the list of `user_ids` for which users should be forced into specific variations.
     * `forcedUsers` will be evaluated before `targets`
     */
    forcedUsers?: {
        [key: string]: IdType
    }

    /**
     * Defines the targets to evaluate what variation a user should be delivered.
     */
    @Type(() => Target)
        targets: Target<IdType>[]
}

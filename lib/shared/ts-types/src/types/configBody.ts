import {
    Project, Environment, Feature, Variable, Variation,
    ListAudience, Audience, FeaturePrerequisites, FeatureWinningVariation,
    TargetDistribution, VariableValue
} from '@devcycle/shared/mongo/schemas'

export type PublicProject<IdType = string> = Pick<Project, 'key'> & { _id: IdType }

export type PublicEnvironment<IdType = string> = Pick<Environment, 'key'> & { _id: IdType }

export type PublicTarget<IdType = string> = {
    _id: IdType
    rollout: PublicRollout
    _audience: PublicAudience<IdType>
    distribution: (Pick<TargetDistribution, 'percentage'> & { _variation: IdType })[]
}

export type PublicRollout = {
    startPercentage: number
    targetPercentage?: number
    startDate?: Date
    targetDate?: Date
}

export type PublicFeatureConfiguration<IdType = string> = {
    _id: IdType
    prerequisites?: (
        Pick<FeaturePrerequisites, 'comparator'> & { _feature: IdType }
    )[]
    winningVariation?: Pick<FeatureWinningVariation, 'updatedAt'> & { _variation: IdType }
    forcedUsers?: { [key: string]: IdType }
    targets: PublicTarget<IdType>[]
}

export type PublicAudience<IdType = string> = Pick<Audience, 'filters'> & { _id: IdType }

export type PublicVariation<IdType = string> = Pick<Variation, | 'name'> & {
    _id: IdType
    variables: {
        _var: IdType
        value: VariableValue
    }[]
}

export type PublicFeature<IdType = string> = Pick<Feature, 'key' | 'type' > & {
    _id: IdType
    variations: PublicVariation<IdType>[]
    configuration: PublicFeatureConfiguration<IdType>
}

export type PublicVariable<IdType = string> = Pick<Variable, 'key' | 'type'> & { _id: IdType }

export type PublicListAudience<IdType = string> = Pick<
        ListAudience,
        'source' | 'appUserKeyName' | 'current'
    > & { _id: IdType }

export interface ConfigBody<IdType = string> {
    /**
     * Basic project data used for building bucketing response
     */
    project: PublicProject<IdType>

    /**
     * Basic environment data used for building bucketing response
     */
    environment: PublicEnvironment<IdType>

    /**
     * Fully populated Feature model containing FeatureConfigurations / Variations / Audiences
     */
    features: PublicFeature<IdType>[]

    /**
     * All dynamic variables in a project
     */
    variables: PublicVariable<IdType>[]

    /**
     * Map of `variable.key` to `hash(variable.key + environment.apiKey)`
     * of all known variable keys. This is used to generate the `knownVariableKeys`
     * in the BucketingAPI response.
     */
    variableHashes: {
        [key: string]: number
    }

    /**
     * **Implement Later**
     *
     * All List Audiences in the project
     * TODO make required when implemented
     */
    listAudiences?: PublicListAudience<IdType>[]
}

import {
    Project, Environment, Variable, Variation,
    ListAudience, Audience, FeatureConfiguration, Rollout, RolloutStage, Feature, Target
} from './models'
import { Type } from 'class-transformer'

export type PublicProject = Project

export type PublicEnvironment = Environment

export { Rollout, RolloutStage, FeatureConfiguration, Feature, Variation, Audience, Variable }

export { Rollout as PublicRollout,
    RolloutStage as PublicRolloutStage,
    FeatureConfiguration as PublicFeatureConfiguration,
    Feature as PublicFeature,
    Variation as PublicVariation,
    Audience as PublicAudience,
    Variable as PublicVariable,
    Target as PublicTarget
}

export class ConfigBody<IdType = string> {
    /**
     * Basic project data used for building bucketing response
     */
    project: Project<IdType>

    /**
     * Basic environment data used for building bucketing response
     */
    environment: Environment<IdType>

    /**
     * Fully populated Feature model containing FeatureConfigurations / Variations / Audiences
     */
     @Type(() => Feature)
     features: Feature<IdType>[]

    /**
     * All dynamic variables in a project
     */
    variables: Variable<IdType>[]

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
    listAudiences?: ListAudience<IdType>[]
}

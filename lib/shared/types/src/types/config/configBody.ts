import {
    Project,
    Environment,
    Variable,
    Variation,
    ListAudience,
    Audience,
    FeatureConfiguration,
    Rollout,
    RolloutStage,
    Feature,
    Target,
} from './models'
import { Type } from 'class-transformer'

export {
    Rollout,
    RolloutStage,
    FeatureConfiguration,
    Feature,
    Variation,
    Audience,
    Variable,
    Project,
    Environment,
}

export {
    Rollout as PublicRollout,
    RolloutStage as PublicRolloutStage,
    FeatureConfiguration as PublicFeatureConfiguration,
    Feature as PublicFeature,
    Variation as PublicVariation,
    Audience as PublicAudience,
    Variable as PublicVariable,
    Target as PublicTarget,
    Project as PublicProject,
    Environment as PublicEnvironment,
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
     * Map of audience id to audience document, used to populate the _audience field for audienceMatch filters
     */
    audiences?: {
        [id: string]: Omit<Audience<IdType>, '_id'>
    }

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

    /**
     * List of DevCycle user IDs that are associated to dashboard profiles, indicating their use in debugging features
     */
    debugUsers?: string[]

    /**
     * SSE information used for establishing connections.
     */
    sse?: {
        hostname: string
        path: string
        inactivityDelay: number
    }
}

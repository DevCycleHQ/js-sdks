import { VariableValue } from './variable'
import { Type } from 'class-transformer'
import { FeatureConfiguration } from './featureConfiguration'

export enum FeatureSource {
    api = 'api',
    dashboard = 'dashboard'
}

export class Variation<IdType = string> {
    /**
     * Mongo primary _id.
     */
    _id: IdType

    name: string
    key: string

    /**
     * Defining variable values.
     */
    variables: {
        /**
         * Variable model mongo _id.
         */
        _var: IdType

        /**
         * Variable value to set for Variation.
         */
        value: VariableValue
    }[]
}

export enum FeatureType {
    release = 'release',
    experiment = 'experiment',
    permission = 'permission',
    ops = 'ops'
}

export type FeatureSettings = {
    optInEnabled: boolean
    publicName: string
    publicDescription: string
}

/**
 * Feature Model. Defines the project-level "container" for a given feature
 */
export class Feature<IdType = string> {
    /**
     * Mongo primary _id.
     */
    _id: IdType

    /**
     * Define the feature type.
     */
    type: FeatureType

    /**
     * Unique key by Project, can be used in the SDK / API to reference by 'key' rather than _id.
     * Must only contain lower-case characters and `_` or `-`.
     */
    key: string

    /**
     * Variation configurations to be used by feature configurations.
     */
    variations: Variation<IdType>[]

    @Type(() => FeatureConfiguration)
        configuration: FeatureConfiguration<IdType>
    
    /**
     * Defines feature-level settings 
     */
    settings?: FeatureSettings
}

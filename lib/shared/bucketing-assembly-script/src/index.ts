import { JSON } from "assemblyscript-json"

export function generateBucketedConfig(configStr: string, userStr: string): string  {
    const config: JSON.Obj = <JSON.Obj>(JSON.parse(configStr))
    const user: JSON.Obj = <JSON.Obj>(JSON.parse(userStr))

    const bucketedConfig = new BucketedUserConfig(config)
    return bucketedConfig.stringify()
}

// type DVCJSON = JSON.Obj // { [key: string]: string | number | boolean }
//
// class DVCAPIUser {
//     isAnonymous: boolean
//     user_id: string
//     email: string | null
//     name: string | null
//     language: string | null
//     country: string | null
//     appVersion: string | null
//     appBuild: f64 //| null
//     customData: DVCJSON | null
//     privateCustomData: DVCJSON | null
//     createdDate: Date | null
//     lastSeenDate: Date | null
//     platform: string | null
//     platformVersion: string | null
//     deviceModel: string | null
//     sdkType: 'server' | null
//     sdkVersion: string | null
// }
//
class PublicProject {
    _id: string | null
    key: string | null

    constructor(project: JSON.Obj | null) {
        if (!project) throw new Error('no project object to construct PublicProject')

        const _id = project.getString("_id")
        if (!_id) {
            throw new Error("Project missing _id")
        } else {
            this._id = _id.stringify()
        }

        const key = project.getString('key')
        if (!key) {
            throw new Error('Project missing key')
        } else {
            this.key = key.stringify()
        }
    }
} // Pick<Project, 'key'> &
//
// class PublicEnvironment<IdType = string> {
//     _id: IdType
//     constructor(_id: IdType) {
//         this._id = _id
//     }
// } //Pick<Environment, 'key'> &
//
// // export class PublicRolloutStage {
// //     type: string //'linear' | 'discrete'
// //     percentage: f64
// //     date: Date
// // }
// //
// // export class PublicRollout {
// //     type: string // 'gradual' | 'stepped' | 'schedule'
// //     startPercentage: f64 | null
// //     startDate: Date
// //     stages: PublicRolloutStage[] | null
// // }
//
// // interface PublicDistribution<IdType = string> {
// //     _variation: IdType // Pick<TargetDistribution, 'percentage'> &
// // }
// // export interface PublicTarget<IdType = string> {
// //     _id: string
// //     rollout: PublicRollout | null
// //     _audience: PublicAudience<IdType>
// //     distribution: PublicDistribution<IdType>[]
// // }
//
// // interface PublicFeaturePrerequisites<IdType = string> {
// //     _feature: IdType // Pick<FeaturePrerequisites, 'comparator'> &
// // }
// //
// // interface PublicFeatureWinningVariation<IdType = string> {
// //     _variation: IdType // Pick<FeatureWinningVariation, 'updatedAt'> &
// // }
// //
// // export class PublicFeatureConfiguration<IdType = string> {
// //     _id: IdType
// //     prerequisites: PublicFeaturePrerequisites<IdType>[] | null
// //     winningVariation: PublicFeatureWinningVariation<IdType> | null
// //     forcedUsers: Map<string, IdType> | null
// //     targets: PublicTarget<IdType>[]
// // }
//
// // interface PublicAudience<IdType = string> { _id: IdType } // Pick<Audience, 'filters'> &
//
// // type VariableValue = string | boolean | number | JSON
// // type JSON = { [key: string]: string | boolean | number }
//
// // interface PublicVariation<IdType = string> { //Pick<Variation, | 'name'> &
// //     _id: IdType
// //     variables: JSON.Arr
// //     //     {
// //     //     _var: IdType
// //     //     value: VariableValue
// //     // }[]
// // }
//
// // enum FeatureType {
// //     release = 'release',
// //     experiment = 'experiment',
// //     permission = 'permission',
// //     ops = 'ops'
// // }
//
// // export class PublicFeature<IdType = string> {
// //     _id: IdType
// //     variations: PublicVariation<IdType>[]
// //     configuration: PublicFeatureConfiguration<IdType>
// //     type: string // FeatureType
// //     key: string
// // }
//
// // interface PublicVariable<IdType = string> { _id: IdType }
// //Pick<Variable, 'key' | 'type'> &
//
// // interface PublicListAudience<IdType = string> { _id: IdType }
//     // Pick<
//     // ListAudience,
//     // 'source' | 'appUserKeyName' | 'current'
//     // > &
//
// class ConfigBody<IdType = string> {
//     /**
//      * Basic project data used for building bucketing response
//      */
//     project: PublicProject<IdType>
//
//     /**
//      * Basic environment data used for building bucketing response
//      */
//     environment: PublicEnvironment<IdType>
//
//     /**
//      * Fully populated Feature model containing FeatureConfigurations / Variations / Audiences
//      */
//     features: JSON.Arr //PublicFeature<IdType>[]
//
//     /**
//      * All dynamic variables in a project
//      */
//     variables: JSON.Arr //PublicVariable<IdType>[]
//
//     /**
//      * Map of `variable.key` to `hash(variable.key + environment.apiKey)`
//      * of all known variable keys. This is used to generate the `knownVariableKeys`
//      * in the BucketingAPI response.
//      */
//     variableHashes: Map<string, u64>
//
//     /**
//      * **Implement Later**
//      *
//      * All List Audiences in the project
//      * TODO make required when implemented
//      */
//     listAudiences: JSON.Arr | null // PublicListAudience<IdType>[] | null
// }
//
// type SDKVariable = JSON.Obj
// //     PublicVariable & {
// //     value: VariableValue
// //     evalReason: unknown | null
// // }
//
// type SDKFeature = JSON.Obj
// //     PublicFeature & { // Pick<PublicFeature, '_id' | 'key' | 'type'>
// //     _variation: string
// //     evalReason: unknown | null
// // }
//
// interface BucketedUserConfigInterface {
//     /**
//      * Project data used for logging
//      */
//     project: PublicProject
//
//     /**
//      * Environment data used for logging
//      */
//     environment: PublicEnvironment
//
//     /**
//      * Mapping of `ClientSDKFeature.key` to `ClientSDKFeature` values.
//      * SDK uses this object to log `allBucketedFeatures()`
//      */
//     features: Map<string, SDKFeature>
//
//     /**
//      * Map of `feature._id` to `variation._id` used for event logging.
//      */
//     featureVariationMap: Map<string, string>
//
//     /**
//      * Mapping of `ClientSDKDynamicVariable.key` to `ClientSDKDynamicVariable` values.
//      * SDK uses this object to retrieve bucketed values for variables.
//      */
//     variables: Map<string, SDKVariable>
//
//     /**
//      * Hashes `murmurhash.v3(variable.key + environment.apiKey)` of all known variable keys
//      * not contained in the `variables` object. This is so the SDK doesn't make
//      * requests for new Variables for known variables.
//      */
//     knownVariableKeys: JSON.Arr | null
// }
//
class BucketedUserConfig {
    project: PublicProject
    environment: JSON.Obj | null //PublicEnvironment
    features: JSON.Obj | null //Map<string, SDKFeature>
    featureVariationMap: JSON.Obj | null //Map<string, string>
    variables: JSON.Obj | null // Map<string, SDKVariable>
    knownVariableKeys: JSON.Arr | null

    constructor(configJSON: JSON.Obj) {
        this.project = new PublicProject(configJSON.getObj("project"))
        this.environment = configJSON.getObj("environment")
        this.features = configJSON.getObj("features")
        this.featureVariationMap = configJSON.getObj("featureVariationMap")
        this.variables = configJSON.getObj("variables")
        this.knownVariableKeys = configJSON.getArr("knownVariableKeys")
    }

    stringify(): string {
        const json: JSON.Obj = new JSON.Obj()
        json.set('project', this.project)
        json.set('environment', this.environment)
        json.set('features', this.features)
        json.set('featureVariationMap', this.featureVariationMap)
        json.set('variables', this.variables)
        json.set('knownVariableKeys', this.knownVariableKeys)
        return json.stringify()
    }
}

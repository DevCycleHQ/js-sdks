import { JSON } from '@devcycle/assemblyscript-json/assembly'
import {
    getJSONObjFromJSON,
    getJSONArrayFromJSON,
    jsonArrFromValueArray,
    jsonObjFromMap,
    getJSONObjFromJSONOptional,
    getStringFromJSONOptional,
} from '../helpers/jsonHelpers'
import { FeatureV2 } from './featureV2'
import { Audience } from './targetV2'
import { PublicEnvironment, PublicProject, Variable} from './configBody'

export class ConfigBodyV2 {
    readonly project: PublicProject
    readonly audiences: Map<string, Audience>
    readonly environment: PublicEnvironment
    readonly features: FeatureV2[]
    readonly variables: Variable[]
    readonly etag: string | null
    readonly clientSDKKey: string | null

    private readonly _variableKeyMap: Map<string, Variable>
    private readonly _variableIdMap: Map<string, Variable>
    private readonly _variableIdToFeatureMap: Map<string, FeatureV2>

    static fromUTF8(
        configUTF8: Uint8Array,
        etag: string | null = null,
    ): ConfigBodyV2 {
        const configJSON = JSON.parse(configUTF8)
        if (!configJSON.isObj) {
            throw new Error(
                'generateBucketedConfig config param not a JSON Object',
            )
        }
        const configJSONObj = configJSON as JSON.Obj
        return new ConfigBodyV2(configJSONObj, etag)
    }

    static fromString(
        configStr: string,
        etag: string | null = null,
    ): ConfigBodyV2 {
        const configJSON = JSON.parse(configStr)
        if (!configJSON.isObj) {
            throw new Error(
                'generateBucketedConfig config param not a JSON Object',
            )
        }
        const configJSONObj = configJSON as JSON.Obj
        return new ConfigBodyV2(configJSONObj, etag)
    }

    constructor(configJSONObj: JSON.Obj, etag: string | null = null) {
        this.etag = etag
        this.clientSDKKey = getStringFromJSONOptional(
            configJSONObj,
            'clientSDKKey'
        )
        this.project = new PublicProject(
            getJSONObjFromJSON(configJSONObj, 'project'),
        )

        this.environment = new PublicEnvironment(
            getJSONObjFromJSON(configJSONObj, 'environment'),
        )

        const featuresJSON = getJSONArrayFromJSON(
            configJSONObj,
            'features',
        ).valueOf()
        const features = new Array<FeatureV2>()
        const _varIdToFeatureMap = new Map<string, FeatureV2>()
        const _featureIdMap = new Map<string, FeatureV2>()

        for (let i = 0; i < featuresJSON.length; i++) {
            const feature = new FeatureV2(featuresJSON[i] as JSON.Obj)
            features.push(feature)

            if (!_featureIdMap.has(feature._id)) {
                _featureIdMap.set(feature._id, feature)
            }

            for (let j = 0; j < feature.variations.length; j++) {
                for (
                    let k = 0;
                    k < feature.variations[j].variables.length;
                    k++
                ) {
                    if (
                        !_varIdToFeatureMap.has(
                            feature.variations[j].variables[k]._var,
                        )
                    ) {
                        _varIdToFeatureMap.set(
                            feature.variations[j].variables[k]._var,
                            feature,
                        )
                    }
                }
            }
        }
        this.features = features
        this._variableIdToFeatureMap = _varIdToFeatureMap

        const audiencesJSON = getJSONObjFromJSONOptional(
            configJSONObj,
            'audiences',
        )
        const audiences = new Map<string, Audience>()
        if (audiencesJSON) {
            const audienceKeys = audiencesJSON.keys
            for (let i = 0; i < audienceKeys.length; i++) {
                const audience_id = audienceKeys[i]
                const aud = audiencesJSON.get(audience_id)
                audiences.set(audience_id, new Audience(aud as JSON.Obj))
            }
        }
        this.audiences = audiences

        const variablesJSON = getJSONArrayFromJSON(
            configJSONObj,
            'variables',
        ).valueOf()
        const variables = new Array<Variable>()
        const _variableKeyMap = new Map<string, Variable>()
        const _variableIdMap = new Map<string, Variable>()
        for (let i = 0; i < variablesJSON.length; i++) {
            const variable = new Variable(variablesJSON[i] as JSON.Obj)
            variables.push(variable)
            _variableKeyMap.set(variable.key, variable)
            _variableIdMap.set(variable._id, variable)
        }
        this.variables = variables
        this._variableKeyMap = _variableKeyMap
        this._variableIdMap = _variableIdMap
    }

    stringify(): string {
        const json: JSON.Obj = new JSON.Obj()
        json.set('project', this.project)
        json.set('environment', this.environment)
        json.set('audiences', jsonObjFromMap(this.audiences))
        json.set('features', jsonArrFromValueArray(this.features))
        json.set('variables', jsonArrFromValueArray(this.variables))
        if (this.clientSDKKey) {
            json.set('clientSDKKey', this.clientSDKKey)
        }
        return json.stringify()
    }

    getVariableForId(variable_id: string): Variable | null {
        return this._variableIdMap.has(variable_id)
            ? this._variableIdMap.get(variable_id)
            : null
    }

    getVariableForKey(variableKey: string): Variable | null {
        return this._variableKeyMap.has(variableKey)
            ? this._variableKeyMap.get(variableKey)
            : null
    }

    getFeatureForVariableId(variable_id: string): FeatureV2 | null {
        return this._variableIdToFeatureMap.has(variable_id)
            ? this._variableIdToFeatureMap.get(variable_id)
            : null
    }
}

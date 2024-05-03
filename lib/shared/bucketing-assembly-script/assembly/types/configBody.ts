import { JSON } from '@devcycle/assemblyscript-json/assembly'
import {
    getStringFromJSON,
    getJSONObjFromJSON,
    getJSONArrayFromJSON,
    jsonArrFromValueArray,
    jsonObjFromMap,
    isValidString,
    getJSONObjFromJSONOptional,
    getStringFromJSONOptional,
} from '../helpers/jsonHelpers'
import { Feature } from './feature'
import { Audience } from './target'

export class PublicProject extends JSON.Value {
    readonly _id: string
    readonly key: string
    readonly a0_organization: string
    readonly settings: JSON.Obj

    constructor(project: JSON.Obj) {
        super()
        this._id = getStringFromJSON(project, '_id')
        this.key = getStringFromJSON(project, 'key')
        this.a0_organization = getStringFromJSON(project, 'a0_organization')
        this.settings = getJSONObjFromJSON(project, 'settings')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('key', this.key)
        json.set('a0_organization', this.a0_organization)
        json.set('settings', this.settings)

        return json.stringify()
    }
}

export class PublicEnvironment extends JSON.Value {
    readonly _id: string
    readonly key: string

    constructor(environment: JSON.Obj) {
        super()
        this._id = getStringFromJSON(environment, '_id')
        this.key = getStringFromJSON(environment, 'key')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('key', this.key)
        return json.stringify()
    }
}

const validVariableTypes = ['String', 'Boolean', 'Number', 'JSON']

export class Variable extends JSON.Value {
    readonly _id: string
    readonly type: string
    readonly key: string

    constructor(variable: JSON.Obj) {
        super()
        this._id = getStringFromJSON(variable, '_id')
        this.type = isValidString(variable, 'type', validVariableTypes)
        this.key = getStringFromJSON(variable, 'key')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('type', this.type)
        json.set('key', this.key)
        return json.stringify()
    }
}

export class ConfigBody {
    readonly project: PublicProject
    readonly audiences: Map<string, Audience>
    readonly environment: PublicEnvironment
    readonly features: Feature[]
    readonly variables: Variable[]
    readonly etag: string | null
    readonly sdkKey: string | null

    private readonly _variableKeyMap: Map<string, Variable>
    private readonly _variableIdMap: Map<string, Variable>
    private readonly _variableIdToFeatureMap: Map<string, Feature>

    static fromUTF8(
        configUTF8: Uint8Array,
        etag: string | null = null,
    ): ConfigBody {
        const configJSON = JSON.parse(configUTF8)
        if (!configJSON.isObj) {
            throw new Error(
                'generateBucketedConfig config param not a JSON Object',
            )
        }
        const configJSONObj = configJSON as JSON.Obj
        return new ConfigBody(configJSONObj, etag)
    }

    static fromString(
        configStr: string,
        etag: string | null = null,
    ): ConfigBody {
        const configJSON = JSON.parse(configStr)
        if (!configJSON.isObj) {
            throw new Error(
                'generateBucketedConfig config param not a JSON Object',
            )
        }
        const configJSONObj = configJSON as JSON.Obj
        return new ConfigBody(configJSONObj, etag)
    }

    constructor(configJSONObj: JSON.Obj, etag: string | null = null) {
        this.etag = etag
        this.sdkKey = getStringFromJSONOptional(configJSONObj, 'sdkKey')

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
        const features = new Array<Feature>()
        const _varIdToFeatureMap = new Map<string, Feature>()
        const _featureIdMap = new Map<string, Feature>()

        for (let i = 0; i < featuresJSON.length; i++) {
            const feature = new Feature(featuresJSON[i] as JSON.Obj)
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
        json.set('sdkKey', this.sdkKey)
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

    getFeatureForVariableId(variable_id: string): Feature | null {
        return this._variableIdToFeatureMap.has(variable_id)
            ? this._variableIdToFeatureMap.get(variable_id)
            : null
    }
}

import { JSON } from 'assemblyscript-json/assembly'
import {
    getJSONObjFromJSON,
    getJSONValueFromJSON,
    getStringFromJSON,
    getStringFromJSONOptional,
    getStringMapFromJSONObj,
    jsonObjFromMap
} from '../helpers/jsonHelpers'
import { PublicProject, PublicEnvironment } from './configBody'
import {
    NullableString,
    SDKVariable_PB,
    VariableType_PB,
    encodeSDKVariable_PB,
} from './'

export class FeatureVariation extends JSON.Obj {
    constructor(
        public readonly _feature: string,
        public readonly _variation: string
    ) {
        super()
    }

    static fromJSONObj(jsonObj: JSON.Obj): FeatureVariation {
        const _feature = jsonObj.getString('_feature')
        const _variation = jsonObj.getString('_variation')
        if (!_feature) throw new Error('Feature Variation missing _feature')
        if (!_variation) throw new Error('Feature Variation missing _variation')
        return new FeatureVariation(_feature.valueOf(), _variation.valueOf())
    }

    static getVariableVariationMapFromJSONObj(jsonObj: JSON.Obj): Map<string, FeatureVariation> {
        const featureVarMap = new Map<string, FeatureVariation>()
        const keys = jsonObj.keys
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const featureVarJSON = jsonObj.getObj(key)
            if (featureVarJSON) {
                featureVarMap.set(key, this.fromJSONObj(featureVarJSON))
            }
        }

        return featureVarMap
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_feature', this._feature)
        json.set('_variation', this._variation)
        return json.stringify()
    }
}

export class BucketedUserConfig extends JSON.Obj {
    constructor(
        public readonly project: PublicProject,
        public readonly environment: PublicEnvironment,
        public readonly features: Map<string, SDKFeature>,
        public readonly featureVariationMap: Map<string, string>,
        public readonly variableVariationMap: Map<string, FeatureVariation>,
        public readonly variables: Map<string, SDKVariable>,
    ) {
        super()
    }

    /**
     * Making this a method instead of constructor that we can use just for testing these models,
     * these values will be generated from the bucketing code.
     */
    static fromJSONString(userConfigStr: string): BucketedUserConfig {
        const userConfigJSON = JSON.parse(userConfigStr)
        if (!userConfigJSON.isObj) throw new Error('bucketedUserConfigFromJSONString not a JSON Object')
        const userConfigJSONObj = userConfigJSON as JSON.Obj

        const project = new PublicProject(getJSONObjFromJSON(userConfigJSONObj, 'project'))

        const environment = new PublicEnvironment(getJSONObjFromJSON(userConfigJSONObj, 'environment'))

        const features = getJSONObjFromJSON(userConfigJSONObj, 'features')
        const featuresMap = new Map<string, SDKFeature>()
        for (let i = 0; i < features.keys.length; i++) {
            const key = features.keys[i]
            features.set(key, SDKFeature.fromJSONObj(features.get(key) as JSON.Obj))
        }

        const featureVar = getJSONObjFromJSON(userConfigJSONObj, 'featureVariationMap')
        const featureVarMap = getStringMapFromJSONObj(featureVar)

        const variableFeatureVariation = getJSONObjFromJSON(userConfigJSONObj, 'variableVariationMap')
        const variableVariationMap = new Map<string, FeatureVariation>()
        for (let i = 0; i < variableFeatureVariation.keys.length; i++) {
            const key = variableFeatureVariation.keys[i]
            const json = variableFeatureVariation.getObj(key)
            if (!json) throw new Error('Missing FeatureVariation object in variableVariationMap')
            variableVariationMap.set(key, FeatureVariation.fromJSONObj(json))
        }

        const variables = getJSONObjFromJSON(userConfigJSONObj, 'variables')
        const variablesMap = new Map<string, SDKVariable>()
        for (let i = 0; i < variables.keys.length; i++) {
            const key = variables.keys[i]
            variablesMap.set(key, SDKVariable.fromJSONObj(variables.get(key) as JSON.Obj))
        }

        return new BucketedUserConfig(
            project,
            environment,
            featuresMap,
            featureVarMap,
            variableVariationMap,
            variablesMap,
        )
    }

    stringify(): string {
        const json: JSON.Obj = new JSON.Obj()
        json.set('project', this.project)
        json.set('environment', this.environment)
        json.set('features', jsonObjFromMap(this.features))
        json.set('featureVariationMap', jsonObjFromMap(this.featureVariationMap))
        json.set('variableVariationMap', jsonObjFromMap(this.variableVariationMap))
        json.set('variables', jsonObjFromMap(this.variables))
        return json.stringify()
    }
}

export class SDKFeature extends JSON.Obj {
    constructor(
        public readonly _id: string,
        public readonly type: string,
        public readonly key: string,
        public readonly _variation: string,
        public readonly variationName: string,
        public readonly variationKey: string,
        public readonly evalReason: string | null
    ) {
        super()
    }

    static fromJSONObj(featureObj: JSON.Obj): SDKFeature {
        return new SDKFeature(
            getStringFromJSON(featureObj, '_id'),
            getStringFromJSON(featureObj, 'type'),
            getStringFromJSON(featureObj, 'key'),
            getStringFromJSON(featureObj, '_variation'),
            getStringFromJSON(featureObj, 'variationName'),
            getStringFromJSON(featureObj, 'variationKey'),
            getStringFromJSONOptional(featureObj, 'evalReason')
        )
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('type', this.type)
        json.set('key', this.key)
        json.set('_variation', this._variation)
        json.set('variationName', this.variationName)
        json.set('variationKey', this.variationKey)
        if (this.evalReason) {
            json.set('evalReason', this.evalReason)
        }
        return json.stringify()
    }
}

export class SDKVariable extends JSON.Obj {
    constructor(
        public readonly _id: string,
        public readonly type: string,
        public readonly key: string,
        public readonly value: JSON.Value,
        public readonly evalReason: string | null,
    ) {
        super()
    }

    static fromJSONString(userConfigStr: string): SDKVariable {
        const configJSON = JSON.parse(userConfigStr)
        if (!configJSON.isObj) {
            throw new Error('SDKVariable not a JSON Object')
        }
        const configJSONObj = configJSON as JSON.Obj
        return SDKVariable.fromJSONObj(configJSONObj)
    }

    static fromJSONObj(variableObj: JSON.Obj): SDKVariable {
        return new SDKVariable(
            getStringFromJSON(variableObj, '_id'),
            getStringFromJSON(variableObj, 'type'),
            getStringFromJSON(variableObj, 'key'),
            getJSONValueFromJSON(variableObj, 'value'),
            getStringFromJSONOptional(variableObj, 'evalReason')
        )
    }

    static variableTypeFromString(str: string): VariableType_PB {
        if (str === 'Boolean') {
            return VariableType_PB.Boolean
        } else if (str === 'Number') {
            return VariableType_PB.Number
        } else if (str === 'String') {
            return VariableType_PB.String
        } else if (str === 'JSON') {
            return VariableType_PB.JSON
        } else {
            throw new Error(`Unknown VariableType: ${str}`)
        }
    }

    toProtobuf(): Uint8Array {
        const boolValue = (this.type === 'Boolean' && this.value.isBool)
            ? (this.value as JSON.Bool).valueOf()
            : false
        const numValue = (this.type === 'Number' && this.value.isInteger)
            ? f64((this.value as JSON.Integer).valueOf())
            : (this.type === 'Number' && this.value.isFloat) ? (this.value as JSON.Float).valueOf() : 0.0
        const stringValue = (this.type === 'String' && this.value.isString)
            ? (this.value as JSON.Str).valueOf()
            : null
        const jsonValue = (this.type === 'JSON' && this.value.isObj)
            ? this.value.stringify()
            : null

        const pbVariable = new SDKVariable_PB(
            this._id,
            SDKVariable.variableTypeFromString(this.type),
            this.key,
            boolValue,
            numValue,
            stringValue || jsonValue || '',
            new NullableString('', true)
        )
        const buff = encodeSDKVariable_PB(pbVariable)

        pbVariable.free()
        heap.free(changetype<usize>(pbVariable))

        return buff
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('type', this.type)
        json.set('key', this.key)
        json.set('value', this.value)
        if (this.evalReason) {
            json.set('evalReason', this.evalReason)
        }
        return json.stringify()
    }
}

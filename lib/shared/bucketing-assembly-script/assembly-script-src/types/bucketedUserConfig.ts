import { JSON } from "assemblyscript-json"
import {
    getJSONArrayFromJSON, getJSONObjFromJSON, getJSONValueFromJSON, getStringFromJSON, getStringFromJSONOptional
} from '../helpers/jsonHelpers'
import { PublicProject, PublicEnvironment } from "./configBody"

export class BucketedUserConfig extends JSON.Obj {
    constructor(
        public project: PublicProject,
        public environment: PublicEnvironment,
        public features: Map<string, SDKFeature>,
        public featureVariationMap: Map<string, string>,
        public variables: Map<string, SDKVariable>,
        public knownVariableKeys: i64[]
    ) {
        super()
    }

    /**
     * Making this a method instead of constructor that we can use just for testing these models,
     * these values will be generated from the bucketing code.
     */
    static bucketedUserConfigFromJSONString(userConfigStr: string): BucketedUserConfig {
        const userConfigJSON = JSON.parse(userConfigStr)
        if (!userConfigJSON.isObj) throw new Error(`bucketedUserConfigFromJSONString not a JSON Object`)
        const userConfigJSONObj = userConfigJSON as JSON.Obj

        const project = new PublicProject(getJSONObjFromJSON(userConfigJSONObj, "project"))

        const environment = new PublicEnvironment(getJSONObjFromJSON(userConfigJSONObj, "environment"))

        const features = getJSONObjFromJSON(userConfigJSONObj, 'features')
        const featuresMap = new Map<string, SDKFeature>()
        for (let i = 0; i < features.keys.length; i++) {
            const key = features.keys[i]
            features.set(key, SDKFeature.sdkFeatureFromJSONObj(features.get(key) as JSON.Obj))
        }

        const featureVar = getJSONObjFromJSON(userConfigJSONObj, 'featureVariationMap')
        const featureVarMap = new Map<string, string>()
        for (let i = 0; i < featureVar.keys.length; i++) {
            const key = featureVar.keys[i]
            const featureVarJson = featureVar.get(key) as JSON.Str
            featureVarMap.set(key, featureVarJson.valueOf())
        }

        const variables = getJSONObjFromJSON(userConfigJSONObj, 'variables')
        const variablesMap = new Map<string, SDKVariable>()
        for (let i = 0; i < variables.keys.length; i++) {
            const key = variables.keys[i]
            variablesMap.set(key, SDKVariable.sdkVariableFromJSONObj(variables.get(key) as JSON.Obj))
        }

        const knownVariableKeys = getJSONArrayFromJSON(userConfigJSONObj, 'knownVariableKeys')
        const knownVariableKeysArray = new Array<i64>()
        for (let i = 0; i < knownVariableKeys.valueOf().length; i++) {
            const num = knownVariableKeys.valueOf()[i]
            if (num && num.isFloat) {
                knownVariableKeysArray.push(i64((num as JSON.Float).valueOf()))
            } else if (num && num.isInteger) {
                knownVariableKeysArray.push((num as JSON.Integer).valueOf())
            }
        }

        return new BucketedUserConfig(
            project,
            environment,
            featuresMap,
            featureVarMap,
            variablesMap,
            knownVariableKeysArray
        )
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

export class SDKFeature extends JSON.Obj {
    constructor(
        public _id: string,
        public type: string,
        public key: string,
        public _variation: string,
        public evalReason: string | null
    ) {
        super()
    }

    static sdkFeatureFromJSONObj(feature: JSON.Obj): SDKFeature {
        return new SDKFeature(
            getStringFromJSON(feature, '_id'),
            getStringFromJSON(feature, 'type'),
            getStringFromJSON(feature, 'key'),
            getStringFromJSON(feature, '_variation'),
            getStringFromJSONOptional(feature, 'evalReason')
        )
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('type', this.type)
        json.set('key', this.key)
        json.set('_variation', this._variation)
        if (this.evalReason) {
            json.set('evalReason', this.evalReason)
        }
        return json.stringify()
    }
}

export class SDKVariable extends JSON.Obj {
    constructor(
        public _id: string,
        public type: string,
        public key: string,
        public value: JSON.Value,
        public evalReason: string | null
    ) {
        super()
    }

    static sdkVariableFromJSONObj(variable: JSON.Obj): SDKVariable {
        return new SDKVariable(
            getStringFromJSON(variable, '_id'),
            getStringFromJSON(variable, 'type'),
            getStringFromJSON(variable, 'key'),
            getJSONValueFromJSON(variable, 'value'),
            getStringFromJSONOptional(variable, 'evalReason')
        )
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

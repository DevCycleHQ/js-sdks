import { JSON } from 'assemblyscript-json/assembly'
import {
    getStringFromJSON,
    getJSONObjFromJSON,
    getJSONArrayFromJSON,
    jsonArrFromValueArray,
    jsonObjFromMap, isValidString
} from '../helpers/jsonHelpers'
import { Feature, IFeature, } from "./feature"

export interface IProject {
    _id: string
    key: string
    a0_organization: string
}

export class PublicProject extends JSON.Value implements IProject {
    _id: string
    key: string
    a0_organization: string

    constructor(project: JSON.Obj) {
        super()
        this._id = getStringFromJSON(project, '_id')
        this.key = getStringFromJSON(project, 'key')
        this.a0_organization = getStringFromJSON(project, 'a0_organization')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('key', this.key)
        json.set('a0_organization', this.a0_organization)

        return json.stringify()
    }
}

export interface IEnvironment {
    _id: string
    key: string
}

export class PublicEnvironment extends JSON.Value implements IEnvironment {
    _id: string
    key: string

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

const validVariableTypes = [
    'String', 'Boolean', 'Number', 'Semver'
]

export interface IVariable {
    _id: string
    type: string
    key: string
}

export class Variable extends JSON.Value implements IVariable {
    _id: string
    type: string
    key: string

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

export interface IConfigBody {
    project: IProject
    environment: IEnvironment
    features: IFeature[]
    variables: IVariable[]
    variableHashes: Map<string, i64>
}

export class ConfigBody extends JSON.Value implements IConfigBody {
    project: PublicProject
    environment: PublicEnvironment
    features: Feature[]
    variables: Variable[]
    variableHashes: Map<string, i64>

    constructor(configStr: string) {
        super()
        const configJSON = JSON.parse(configStr)
        if (!configJSON.isObj) throw new Error(`generateBucketedConfig config param not a JSON Object`)
        const configJSONObj = configJSON as JSON.Obj

        this.project = new PublicProject(getJSONObjFromJSON(configJSONObj, "project"))

        this.environment = new PublicEnvironment(getJSONObjFromJSON(configJSONObj, "environment"))

        const features = getJSONArrayFromJSON(configJSONObj, 'features')
        this.features = features.valueOf().map<Feature>((feature) => {
            return new Feature(feature as JSON.Obj)
        })

        const variables = getJSONArrayFromJSON(configJSONObj, 'variables')
        this.variables = variables.valueOf().map<Variable>((variable) => {
            return new Variable(variable as JSON.Obj)
        })

        const variableHashes = getJSONObjFromJSON(configJSONObj, 'variableHashes')
        const variableHashesMap = new Map<string, i64>()
        const keys = variableHashes.keys
        for (let i=0; i < keys.length; i++) {
            const key = keys[i]
            const value = variableHashes.getInteger(key)
            if (!value) throw new Error(`Unable to get variableHashes value for key: ${key}`)
            variableHashesMap.set(key, value.valueOf())
        }
        this.variableHashes = variableHashesMap
    }


    stringify(): string {
        const json: JSON.Obj = new JSON.Obj()
        json.set('project', this.project)
        json.set('environment', this.environment)
        json.set('features', jsonArrFromValueArray(this.features))
        json.set('variables', jsonArrFromValueArray(this.variables))
        json.set('variableHashes', jsonObjFromMap(this.variableHashes))
        return json.stringify()
    }
}

import { JSON } from "assemblyscript-json"
import {
    getStringFromJSON,
    getJSONObjFromJSON,
    getJSONArrayFromJSON,
    jsonArrFromValueArray,
    jsonObjFromMap, isValidString
} from './jsonHelpers'
import { Feature,  } from "./feature"


export class PublicProject extends JSON.Value {
    _id: string
    key: string

    constructor(project: JSON.Obj) {
        super()
        this._id = getStringFromJSON(project, '_id')
        this.key = getStringFromJSON(project, 'key')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('key', this.key)
        return json.stringify()
    }
}

export class PublicEnvironment extends JSON.Value {
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

export class Variable extends JSON.Value {
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

export class ConfigBody {
    project: PublicProject
    environment: PublicEnvironment
    features: Feature[]
    variables: Variable[]
    variableHashes: Map<string, i64>

    constructor(configJSON: JSON.Obj) {
        this.project = new PublicProject(getJSONObjFromJSON(configJSON, "project"))

        this.environment = new PublicEnvironment(getJSONObjFromJSON(configJSON, "environment"))

        const features = getJSONArrayFromJSON(configJSON, 'features')
        this.features = features.valueOf().map<Feature>((feature) => {
            return new Feature(feature as JSON.Obj)
        })

        const variables = getJSONArrayFromJSON(configJSON, 'variables')
        this.variables = variables.valueOf().map<Variable>((variable) => {
            return new Variable(variable as JSON.Obj)
        })

        const variableHashes = getJSONObjFromJSON(configJSON, 'variableHashes')
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

import { JSON } from 'assemblyscript-json/assembly'
import {
    getJSONArrayFromJSON,
    getJSONObjFromJSON, getJSONObjFromJSONOptional, getJSONValueFromJSON,
    getStringFromJSON,
    isValidString,
    jsonArrFromValueArray
} from '../helpers/jsonHelpers'
import { FeatureConfiguration } from './featureConfiguration'

const validTypes = ['release', 'experiment', 'permission', 'ops']

export class Feature extends JSON.Value {
    readonly _id: string
    readonly type: string
    readonly key: string
    readonly variations: Variation[]
    readonly configuration: FeatureConfiguration
    readonly settings: JSON.Obj | null

    private readonly _variationsById: Map<string, Variation>

    constructor(feature: JSON.Obj) {
        super()
        this._id = getStringFromJSON(feature, '_id')

        this.type = isValidString(feature, 'type', validTypes)

        this.key = getStringFromJSON(feature, 'key')

        const variationsJSON = getJSONArrayFromJSON(feature, 'variations').valueOf()
        const variations = new Array<Variation>()
        const variationsById = new Map<string, Variation>()
        for (let i = 0; i < variationsJSON.length; i++) {
            const variation = new Variation(variationsJSON[i] as JSON.Obj)
            variations.push(variation)
            variationsById.set(variation._id, variation)
        }
        this.variations = variations
        this._variationsById = variationsById

        this.configuration = new FeatureConfiguration(getJSONObjFromJSON(feature, 'configuration'))

        this.settings = getJSONObjFromJSONOptional(feature, 'settings')
    }

    getVariationById(variationId: string): Variation | null {
        if (!this._variationsById.has(variationId)) return null
        return this._variationsById.get(variationId)
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('type', this.type)
        json.set('key', this.key)
        json.set('variations', jsonArrFromValueArray(this.variations))
        json.set('configuration', this.configuration)
        return json.stringify()
    }
}

export class Variation extends JSON.Value {
    readonly _id: string
    readonly name: string
    readonly key: string
    readonly variables: Array<VariationVariable>

    private readonly _variablesById: Map<string, VariationVariable>

    constructor(variation: JSON.Obj) {
        super()
        this._id = getStringFromJSON(variation, '_id')

        this.name = getStringFromJSON(variation, 'name')
        this.key = getStringFromJSON(variation, 'key')

        const variablesJSON = getJSONArrayFromJSON(variation, 'variables').valueOf()
        const variables = new Array<VariationVariable>()
        const variablesById = new Map<string, VariationVariable>()
        for (let i = 0; i < variablesJSON.length; i++) {
            const variable = new VariationVariable(variablesJSON[i] as JSON.Obj)
            variables.push(variable)
            variablesById.set(variable._var, variable)
        }
        this.variables = variables
        this._variablesById = variablesById
    }

    getVariableById(variableId: string): VariationVariable | null {
        return this._variablesById.has(variableId)
            ? this._variablesById.get(variableId)
            : null
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('name', this.name)
        json.set('key', this.key)
        json.set('variables', jsonArrFromValueArray(this.variables))

        return json.stringify()
    }
}

export class VariationVariable extends JSON.Value {
    readonly _var: string
    readonly value: JSON.Value

    constructor(variable: JSON.Obj) {
        super()
        this._var = getStringFromJSON(variable, '_var')
        this.value = getJSONValueFromJSON(variable, 'value')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_var', this._var)
        json.set('value', this.value)
        return json.stringify()
    }
}


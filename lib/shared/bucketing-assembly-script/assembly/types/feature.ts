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
    _id: string
    type: string
    key: string
    variations: Variation[]
    configuration: FeatureConfiguration
    settings: JSON.Obj | null

    constructor(feature: JSON.Obj) {
        super()
        this._id = getStringFromJSON(feature, '_id')

        this.type = isValidString(feature, 'type', validTypes)

        this.key = getStringFromJSON(feature, 'key')

        const variations = getJSONArrayFromJSON(feature, 'variations')
        this.variations = variations.valueOf().map<Variation>((variation) => {
            return new Variation(variation as JSON.Obj)
        })

        this.configuration = new FeatureConfiguration(getJSONObjFromJSON(feature, 'configuration'))

        this.settings = getJSONObjFromJSONOptional(feature, 'settings')
        
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
    _id: string
    name: string
    key: string
    variables: Array<VariationVariable>

    constructor(variation: JSON.Obj) {
        super()
        this._id = getStringFromJSON(variation, '_id')

        this.name = getStringFromJSON(variation, 'name')
        this.key = getStringFromJSON(variation, 'key')

        const variables = getJSONArrayFromJSON(variation, 'variables')
        this.variables = variables.valueOf().map<VariationVariable>((variable) => {
            return new VariationVariable(variable as JSON.Obj)
        })
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
    _var: string
    value: JSON.Value

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


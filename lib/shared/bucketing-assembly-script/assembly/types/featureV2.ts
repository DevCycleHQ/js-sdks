import { JSON } from '@devcycle/assemblyscript-json/assembly'
import {
    getJSONArrayFromJSON,
    getJSONObjFromJSON, getJSONObjFromJSONOptional,
    getStringFromJSON,
    isValidString,
    jsonArrFromValueArray
} from '../helpers/jsonHelpers'
import { FeatureConfigurationV2 } from './featureConfigurationV2'
import { Variation } from './feature'

const validTypes = ['release', 'experiment', 'permission', 'ops']

export class FeatureV2 extends JSON.Value {
    readonly _id: string
    readonly type: string
    readonly key: string
    readonly variations: Variation[]
    readonly configuration: FeatureConfigurationV2
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

        this.configuration = new FeatureConfigurationV2(getJSONObjFromJSON(feature, 'configuration'))

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

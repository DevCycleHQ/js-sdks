import { JSON } from 'assemblyscript-json/assembly'

export class Overrides extends JSON.Obj {
    constructor(public readonly overrides: JSON.Obj | null) {
        super()
    }

    static fromUTF8(userStr: Uint8Array): Overrides {
        const overridesJSON = JSON.parse(userStr)
        if (!overridesJSON.isObj) throw new Error('overrides not a JSON Object')
        return this.fromJSONObj(overridesJSON as JSON.Obj)
    }

    static fromJSONObj(overrides: JSON.Obj): Overrides {
        return new Overrides(overrides)
    }

    stringify(): string {
        if (!this.overrides) return '{}'
        return this.overrides.stringify()
    }
}

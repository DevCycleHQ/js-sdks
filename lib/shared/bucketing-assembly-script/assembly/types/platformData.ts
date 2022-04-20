import { JSON } from 'assemblyscript-json/assembly'
import { getStringFromJSON } from '../helpers/jsonHelpers'

export class PlatformData extends JSON.Obj {
    platform: string
    platformVersion: string
    sdkType: string
    sdkVersion: string

    constructor(str: string) {
        super()
        const json = JSON.parse(str)
        if (!json.isObj) throw new Error('Platform data not a JSON Object')
        const jsonObj = json as JSON.Obj

        this.platform = getStringFromJSON(jsonObj, 'platform')
        this.platformVersion = getStringFromJSON(jsonObj, 'platformVersion')
        this.sdkType = getStringFromJSON(jsonObj, 'sdkType')
        this.sdkVersion = getStringFromJSON(jsonObj, 'sdkVersion')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('platform', this.platform)
        json.set('platformVersion', this.platformVersion)
        json.set('sdkType', this.sdkType)
        json.set('sdkVersion', this.sdkVersion)
        return json.stringify()
    }
}

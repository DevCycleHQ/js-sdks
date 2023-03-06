import { JSON } from 'assemblyscript-json/assembly'
import {
    getStringFromJSON,
    getStringFromJSONOptional
} from '../helpers/jsonHelpers'

export class PlatformData extends JSON.Obj {
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: string
    readonly sdkVersion: string
    readonly hostname: string | null

    constructor(str: string) {
        super()
        const json = JSON.parse(str)
        if (!json.isObj) throw new Error('Platform data not a JSON Object')
        const jsonObj = json as JSON.Obj

        this.platform = getStringFromJSON(jsonObj, 'platform')
        this.platformVersion = getStringFromJSON(jsonObj, 'platformVersion')
        this.sdkType = getStringFromJSON(jsonObj, 'sdkType')
        this.sdkVersion = getStringFromJSON(jsonObj, 'sdkVersion')
        this.hostname = getStringFromJSONOptional(jsonObj, 'hostname')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('platform', this.platform)
        json.set('platformVersion', this.platformVersion)
        json.set('sdkType', this.sdkType)
        json.set('sdkVersion', this.sdkVersion)
        if (this.hostname) json.set('hostname', this.hostname)
        return json.stringify()
    }
}

export function testPlatformDataClass(dataStr: string): string {
    const platformData = new PlatformData(dataStr)
    return platformData.stringify()
}


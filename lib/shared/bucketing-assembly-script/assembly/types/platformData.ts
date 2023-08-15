import { JSON } from '@devcycle/assemblyscript-json/assembly'
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

    static fromUTF8(platformDataUTF8: Uint8Array): PlatformData {
        const platformJSON = JSON.parse(platformDataUTF8)
        if (!platformJSON.isObj) throw new Error('platformData param not a JSON Object')
        const platformJSONObj = platformJSON as JSON.Obj
        return new PlatformData(platformJSONObj)
    }

    static fromString(platformDataStr: string): PlatformData {
        const platformJSON = JSON.parse(platformDataStr)
        if (!platformJSON.isObj) throw new Error('platformData config param not a JSON Object')
        const platformJSONObj = platformJSON as JSON.Obj
        return new PlatformData(platformJSONObj)
    }

    constructor(platformJSONObj: JSON.Obj) {
        super()

        this.platform = getStringFromJSON(platformJSONObj, 'platform')
        this.platformVersion = getStringFromJSON(platformJSONObj, 'platformVersion')
        this.sdkType = getStringFromJSON(platformJSONObj, 'sdkType')
        this.sdkVersion = getStringFromJSON(platformJSONObj, 'sdkVersion')
        this.hostname = getStringFromJSONOptional(platformJSONObj, 'hostname')
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
    const platformData = PlatformData.fromString(dataStr)
    return platformData.stringify()
}

export function testPlatformDataClassFromUTF8(dataStr: Uint8Array): string {
    const platformData = PlatformData.fromUTF8(dataStr)
    return platformData.stringify()
}

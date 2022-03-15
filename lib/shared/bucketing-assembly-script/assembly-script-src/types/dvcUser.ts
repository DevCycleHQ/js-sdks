import { JSON } from "assemblyscript-json"
import {
    getDateFromJSONOptional, getF64FromJSONOptional, getStringFromJSON, getStringFromJSONOptional, jsonObjFromMap
} from "./jsonHelpers"

const validSdkTypes = ['client', 'server']

export class DVCUser extends JSON.Obj {
    constructor(
        public user_id: string,
        public email: string | null,
        public name: string | null,
        public language: string | null,
        public country: string | null,
        public appVersion: string | null,
        public appBuild: f64,
        // TODO implement CustomDataValue Class
        public customData: Map<string, string> | null,
        public privateCustomData: Map<string, string> | null,
        public createdDate: Date | null,
        public lastSeenDate: Date | null,
        public platform: string | null,
        public platformVersion: string | null,
        public deviceModel: string | null,
        public sdkType: string | null,
        public sdkVersion: string | null
    ) {
        super()
        if (this.sdkType && !validSdkTypes.includes(this.sdkType as string)) {
            const sdkType = this.sdkType as string
            throw new Error(`Not valid sdkType value: ${sdkType}`)
        }
    }

    private static stringMapFromJSONObj(jsonObj: JSON.Obj): Map<string, string> {
        const map = new Map<string, string>()
        for (let i=0; i < jsonObj.keys.length; i++) {
            const key = jsonObj.keys[i]
            const value = jsonObj.get(key)
            if (value && value.isString) {
                map.set(key, (value as JSON.Str).valueOf())
            } else {
                throw new Error(
                    `Value in JSON Object for key: ${key}, is not string to cast to Map<string, string>`
                )
            }
        }
        return map
    }

    static dvcUserFromJSONString(userStr: string): DVCUser {
        const userJSON = JSON.parse(userStr)
        if (!userJSON.isObj) throw new Error(`dvcUserFromJSONString not a JSON Object`)
        const user = userJSON as JSON.Obj

        const customData = user.getObj('customData')
        const privateCustomData = user.getObj('privateCustomData')

        return new DVCUser(
            getStringFromJSON(user, 'user_id'),
            getStringFromJSONOptional(user, 'email'),
            getStringFromJSONOptional(user, 'name'),
            getStringFromJSONOptional(user, 'language'),
            getStringFromJSONOptional(user, 'country'),
            getStringFromJSONOptional(user, 'appVersion'),
            getF64FromJSONOptional(user, 'appBuild', -1),
            customData ? this.stringMapFromJSONObj(customData) : null,
            privateCustomData? this.stringMapFromJSONObj(privateCustomData) : null,
            getDateFromJSONOptional(user, 'createdDate'),
            getDateFromJSONOptional(user, 'lastSeenDate'),
            getStringFromJSONOptional(user, 'platform'),
            getStringFromJSONOptional(user, 'platformVersion'),
            getStringFromJSONOptional(user, 'deviceModel'),
            getStringFromJSONOptional(user, 'sdkType'),
            getStringFromJSONOptional(user, 'sdkVersion'),
        )
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('user_id', this.user_id)
        if (this.email) json.set('email', this.email)
        if (this.name) json.set('name', this.name)
        if (this.language) json.set('language', this.language)
        if (this.country) json.set('country', this.country)
        if (this.appVersion) json.set('appVersion', this.appVersion)
        if (this.appBuild != -1) json.set('appBuild', this.appBuild)
        if (this.customData) {
            json.set('customData', jsonObjFromMap(this.customData as Map<string, string>))
        }
        if (this.privateCustomData) {
            json.set('privateCustomData', jsonObjFromMap(this.privateCustomData as Map<string, string>))
        }
        if (this.createdDate) json.set('createdDate', (this.createdDate as Date).toISOString())
        if (this.lastSeenDate) json.set('lastSeenDate', (this.lastSeenDate as Date).toISOString())
        if (this.platform) json.set('platform', this.platform)
        if (this.sdkType) json.set('platformVersion', this.sdkType)
        if (this.sdkType) json.set('deviceModel', this.sdkType)
        if (this.sdkType) json.set('sdkType', this.sdkType)
        if (this.sdkVersion) json.set('sdkVersion', this.sdkVersion)
        return json.stringify()
    }
}

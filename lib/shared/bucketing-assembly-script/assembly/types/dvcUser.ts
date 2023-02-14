import { JSON } from 'assemblyscript-json/assembly'
import {
    getF64FromJSONOptional, getStringFromJSON, getStringFromJSONOptional, isFlatJSONObj
} from '../helpers/jsonHelpers'
import { _getPlatformData } from '../managers/platformDataManager'

interface DVCUserInterface {
    user_id: string
    email: string | null
    name: string | null
    language: string | null
    country: string | null
    appVersion: string | null
    appBuild: f64
    deviceModel: string | null
    customData: JSON.Obj | null
    privateCustomData: JSON.Obj | null
}

export class DVCUser extends JSON.Obj implements DVCUserInterface {
    constructor(
        public user_id: string,
        public email: string | null,
        public name: string | null,
        public language: string | null,
        public country: string | null,
        public appBuild: f64,
        public appVersion: string | null,
        public deviceModel: string | null,
        public customData: JSON.Obj | null,
        public privateCustomData: JSON.Obj | null
    ) {
        super()
    }

    static fromJSONString(userStr: string): DVCUser {
        const userJSON = JSON.parse(userStr)
        if (!userJSON.isObj) throw new Error('dvcUserFromJSONString not a JSON Object')
        const user = userJSON as JSON.Obj

        const customData = user.getObj('customData')
        if (!isFlatJSONObj(customData)) {
            throw new Error('DVCUser customData can\'t contain nested objects or arrays')
        }

        const privateCustomData = user.getObj('privateCustomData')
        if (!isFlatJSONObj(privateCustomData)) {
            throw new Error('DVCUser privateCustomData can\'t contain nested objects or arrays')
        }

        return new DVCUser(
            getStringFromJSON(user, 'user_id'),
            getStringFromJSONOptional(user, 'email'),
            getStringFromJSONOptional(user, 'name'),
            getStringFromJSONOptional(user, 'language'),
            getStringFromJSONOptional(user, 'country'),
            getF64FromJSONOptional(user, 'appBuild', NaN),
            getStringFromJSONOptional(user, 'appVersion'),
            getStringFromJSONOptional(user, 'deviceModel'),
            customData,
            privateCustomData
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
        if (!isNaN(this.appBuild)) json.set('appBuild', this.appBuild)
        if (this.deviceModel) json.set('deviceModel', this.deviceModel)
        if (this.customData) json.set('customData', this.customData)
        if (this.privateCustomData) json.set('privateCustomData', this.privateCustomData)
        return json.stringify()
    }
}

export class DVCPopulatedUser extends JSON.Value implements DVCUserInterface {
    user_id: string
    email: string | null
    name: string | null
    language: string | null
    country: string | null
    appVersion: string | null
    appBuild: f64
    customData: JSON.Obj | null
    privateCustomData: JSON.Obj | null
    private combinedCustomData: JSON.Obj
    deviceModel: string | null

    createdDate: Date
    lastSeenDate: Date
    platform: string
    platformVersion: string
    sdkType: string
    sdkVersion: string

    constructor(user: DVCUser) {
        super()
        this.user_id = user.user_id
        this.email = user.email
        this.name = user.name
        this.language = user.language
        this.country = user.country
        this.appVersion = user.appVersion
        this.appBuild = user.appBuild
        this.customData = user.customData
        this.privateCustomData = user.privateCustomData
        this.deviceModel = user.deviceModel

        this.combinedCustomData = new JSON.Obj()

        const customData = this.customData
        if (customData) {
            for (let i = 0; i < customData.keys.length; i++) {
                const key = customData.keys[i]
                this.combinedCustomData.set(key, customData.get(key))
            }
        }

        const privateCustomData = this.privateCustomData
        if (privateCustomData) {
            for (let i = 0; i < privateCustomData.keys.length; i++) {
                const key = privateCustomData.keys[i]
                this.combinedCustomData.set(key, privateCustomData.get(key))
            }
        }

        this.createdDate = new Date(Date.now())
        this.lastSeenDate = new Date(Date.now())

        const platformData = _getPlatformData()
        this.platform = platformData.platform
        this.platformVersion = platformData.platformVersion
        this.sdkType = platformData.sdkType
        this.sdkVersion = platformData.sdkVersion
    }

    static fromJSONString(userStr: string): DVCPopulatedUser {
        return new DVCPopulatedUser(DVCUser.fromJSONString(userStr))
    }

    getCombinedCustomData(): JSON.Obj {
        return this.combinedCustomData
    }

    mergeClientCustomData(clientCustomData: JSON.Obj): void {
        if (!this.customData && clientCustomData.keys.length > 0) {
            this.customData = new JSON.Obj()
        }

        for (let i = 0; i < clientCustomData.keys.length; i++) {
            if (!this.customData!.has(clientCustomData.keys[i])
                    && (this.privateCustomData && !this.privateCustomData!.has(clientCustomData.keys[i]))) {
                this.customData!.set(clientCustomData.keys[i], clientCustomData.get(clientCustomData.keys[i]))
            }
        }
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('user_id', this.user_id)
        if (this.email) json.set('email', this.email)
        if (this.name) json.set('name', this.name)
        if (this.language) json.set('language', this.language)
        if (this.country) json.set('country', this.country)
        if (this.appVersion) json.set('appVersion', this.appVersion)
        if (!isNaN(this.appBuild)) json.set('appBuild', this.appBuild)
        if (this.deviceModel) json.set('deviceModel', this.deviceModel)

        if (this.customData) {
            json.set('customData', this.customData)
        }
        if (this.privateCustomData) {
            json.set('privateCustomData', this.privateCustomData)
        }

        json.set('createdDate', (this.createdDate as Date).toISOString())
        json.set('lastSeenDate', (this.lastSeenDate as Date).toISOString())
        json.set('platform', this.platform)
        json.set('platformVersion', this.platformVersion)
        json.set('sdkType', this.sdkType)
        json.set('sdkVersion', this.sdkVersion)
        return json.stringify()
    }
}

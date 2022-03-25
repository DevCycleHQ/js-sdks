import { JSON } from "assemblyscript-json"
import {
    getF64FromJSONOptional, getStringFromJSON, getStringFromJSONOptional
} from "../helpers/jsonHelpers"

interface DVCUserInterface {
    user_id: string
    email: string | null
    name: string | null
    language: string | null
    country: string | null
    appVersion: string | null
    appBuild: f64
    customData: JSON.Obj | null
    privateCustomData: JSON.Obj | null
}

export class DVCUser extends JSON.Obj implements DVCUserInterface {
    user_id: string
    email: string | null
    name: string | null
    language: string | null
    country: string | null
    appVersion: string | null
    appBuild: f64
    customData: JSON.Obj | null
    privateCustomData: JSON.Obj | null

    constructor(userStr: string) {
        super()
        const userJSON = JSON.parse(userStr)
        if (!userJSON.isObj) throw new Error(`dvcUserFromJSONString not a JSON Object`)
        const user = userJSON as JSON.Obj

        this.user_id = getStringFromJSON(user, 'user_id')
        this.email = getStringFromJSONOptional(user, 'email')
        this.name = getStringFromJSONOptional(user, 'name')
        this.language = getStringFromJSONOptional(user, 'language')
        this.country = getStringFromJSONOptional(user, 'country')
        this.appVersion = getStringFromJSONOptional(user, 'appVersion')

        // Need to set a default "null" value, as numbers can't be null in AS
        this.appBuild = getF64FromJSONOptional(user, 'appBuild', -1)

        const customData = user.getObj('customData')
        this.customData = (customData && customData.isObj) ? customData : null

        const privateCustomData = user.getObj('privateCustomData')
        this.privateCustomData = (privateCustomData && privateCustomData.isObj) ? privateCustomData : null

        return this
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
    createdDate: Date
    lastSeenDate: Date
    platform: string
    platformVersion: string
    deviceModel: string
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

        this.createdDate = new Date(Date.now())
        this.lastSeenDate = new Date(Date.now())

        // TODO: set these from init function
        this.platform = 'NodeJS'
        this.platformVersion = ''
        this.deviceModel = ''
        this.sdkType = 'server'
        this.sdkVersion = '1.0.0'
    }

    static populatedUserFromString(userStr: string): DVCPopulatedUser {
        return new DVCPopulatedUser(new DVCUser(userStr))
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
            json.set('customData', this.customData)
        }
        if (this.privateCustomData) {
            json.set('privateCustomData', this.privateCustomData)
        }

        json.set('createdDate', (this.createdDate as Date).toISOString())
        json.set('lastSeenDate', (this.lastSeenDate as Date).toISOString())
        json.set('platform', this.platform)
        json.set('platformVersion', this.platformVersion)
        json.set('deviceModel', this.deviceModel)
        json.set('sdkType', this.sdkType)
        json.set('sdkVersion', this.sdkVersion)
        return json.stringify()
    }
}

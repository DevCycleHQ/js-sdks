import { JSON } from 'assemblyscript-json/assembly'
import {
    getF64FromJSONOptional, getStringFromJSON, getStringFromJSONOptional, isFlatJSONObj
} from '../helpers/jsonHelpers'
import { _getPlatformData } from '../managers/platformDataManager'
import { DVCUser_PB, NullableString, NullableDouble, encodeDVCUser_PB } from './'

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

function getJSONObjFromPBCustomData(nullableCustomData: NullableCustomData | null): JSON.Obj | null  {
    if (nullableCustomData && !nullableCustomData.isNull) {
        const customDataObj = new JSON.Obj()
        const keys = nullableCustomData.value.keys()
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const value: CustomDataValue = nullableCustomData.value.get(key)
            if (value && value.type == VariableType_PB.Boolean) {
                customDataObj.set(key, value.boolValue)
            } else if (value && value.type == VariableType_PB.Number) {
                customDataObj.set(key, value.doubleValue)
            } else if (value && value.type == VariableType_PB.String) {
                customDataObj.set(key, value.stringValue)
            } else {
                throw new Error('DVCUser_PB customData can\'t contain JSON data values')
            }
        }

        if (!isFlatJSONObj(customDataObj)) {
            throw new Error('DVCUser customData can\'t contain nested objects or arrays')
        }
        return customDataObj
    }
    return null
}

export class DVCUser extends JSON.Obj implements DVCUserInterface {
    constructor(
        public readonly user_id: string,
        public readonly email: string | null,
        public readonly name: string | null,
        public readonly language: string | null,
        public readonly country: string | null,
        public readonly appBuild: f64,
        public readonly appVersion: string | null,
        public readonly deviceModel: string | null,
        public readonly customData: JSON.Obj | null,
        public readonly privateCustomData: JSON.Obj | null
    ) {
        super()
    }

    static fromPB(userPB: DVCUser_PB): DVCUser {
        const nullableEmail = userPB.email
        const nullableName = userPB.name
        const nullableLanguage = userPB.language
        const nullableCountry = userPB.country
        const nullableAppBuild = userPB.appBuild
        const nullableAppVersion = userPB.appVersion
        const nullableDeviceModel = userPB.deviceModel
        const nullableCustomData = userPB.customData
        const nullablePrivateCustomData = userPB.privateCustomData

        return new DVCUser(
            userPB.userId,
            (nullableEmail && !nullableEmail.isNull) ? nullableEmail.value : null,
            (nullableName && !nullableName.isNull) ? nullableName.value : null,
            (nullableLanguage && !nullableLanguage.isNull) ? nullableLanguage.value : null,
            (nullableCountry && !nullableCountry.isNull) ? nullableCountry.value : null,
            (nullableAppBuild && !nullableAppBuild.isNull) ? nullableAppBuild.value : NaN,
            (nullableAppVersion && !nullableAppVersion.isNull) ? nullableAppVersion.value : null,
            (nullableDeviceModel && !nullableDeviceModel.isNull) ? nullableDeviceModel.value : null,
            getJSONObjFromPBCustomData(nullableCustomData),
            getJSONObjFromPBCustomData(nullablePrivateCustomData),
        )
    }

    toProtoBuf(): Uint8Array {
        return encodeDVCUser_PB(new DVCUser_PB(
            this.user_id,
            new NullableString(this.email || '', this.email === null),
            new NullableString(this.name || '', this.name === null),
            new NullableString(this.language || '', this.language === null),
            new NullableString(this.country || '', this.country === null),
            new NullableDouble(this.appBuild || 0.0, isNaN(this.appBuild)),
            new NullableString(this.appVersion || '', this.appVersion === null),
            new NullableString(this.deviceModel || '', this.deviceModel === null)
        ))
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
    readonly user_id: string
    readonly email: string | null
    readonly name: string | null
    readonly language: string | null
    readonly country: string | null
    readonly appVersion: string | null
    readonly appBuild: f64
    customData: JSON.Obj | null
    privateCustomData: JSON.Obj | null
    private _combinedCustomData: JSON.Obj
    readonly deviceModel: string | null

    readonly createdDate: Date
    readonly lastSeenDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: string
    readonly sdkVersion: string
    readonly hostname: string | null

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

        const combinedCustomData = new JSON.Obj()

        const customData = user.customData
        if (customData) {
            for (let i = 0; i < customData.keys.length; i++) {
                const key = customData.keys[i]
                combinedCustomData.set(key, customData.get(key))
            }
        }

        const privateCustomData = user.privateCustomData
        if (privateCustomData) {
            for (let i = 0; i < privateCustomData.keys.length; i++) {
                const key = privateCustomData.keys[i]
                combinedCustomData.set(key, privateCustomData.get(key))
            }
        }
        this._combinedCustomData = combinedCustomData

        this.createdDate = new Date(Date.now())
        this.lastSeenDate = new Date(Date.now())

        const platformData = _getPlatformData()
        this.platform = platformData.platform
        this.platformVersion = platformData.platformVersion
        this.sdkType = platformData.sdkType
        this.sdkVersion = platformData.sdkVersion
        this.hostname = platformData.hostname
        return this
    }

    static fromJSONString(userStr: string): DVCPopulatedUser {
        return new DVCPopulatedUser(DVCUser.fromJSONString(userStr))
    }

    getCombinedCustomData(): JSON.Obj {
        return this._combinedCustomData
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
        if (this.hostname) json.set('hostname', this.hostname)
        return json.stringify()
    }
}

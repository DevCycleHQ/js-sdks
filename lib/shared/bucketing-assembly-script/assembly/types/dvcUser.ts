import { JSON } from 'assemblyscript-json/assembly'
import {
    getF64FromJSONOptional, getStringFromJSON, getStringFromJSONOptional, isFlatJSONObj
} from '../helpers/jsonHelpers'
import { _getPlatformData } from '../managers/platformDataManager'
import {
    DVCUser_PB,
    encodeDVCUser_PB,
    NullableString,
    NullableDouble,
    NullableCustomData,
    CustomDataValue,
    CustomDataType
} from './'

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
    if (!nullableCustomData || nullableCustomData.isNull) return null

    const customDataObj = new JSON.Obj()
    const keys = nullableCustomData.value.keys()

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value: CustomDataValue = nullableCustomData.value.get(key)
        if (value && value.type === CustomDataType.Bool) {
            customDataObj.set(key, value.boolValue)
        } else if (value && value.type === CustomDataType.Num) {
            customDataObj.set(key, value.doubleValue)
        } else if (value && value.type === CustomDataType.Str) {
            customDataObj.set(key, value.stringValue)
        } else if (value && value.type === CustomDataType.Null) {
            customDataObj.set(key, new JSON.Null())
        } else {
            throw new Error('DVCUser customData can\'t contain nested objects or arrays')
        }
    }

    return customDataObj
}

function nullableCustomDataFromJSONObj(jsonObj: JSON.Obj | null): NullableCustomData {
    if (!jsonObj) return new NullableCustomData(new Map(), true)

    const keys = jsonObj.keys
    const customDataMap = new Map<string, CustomDataValue>()
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value = jsonObj.get(key)
        if (!value) continue

        if (value.isBool) {
            customDataMap.set(key, new CustomDataValue(CustomDataType.Bool, (value as JSON.Bool).valueOf()))
        } else if (value.isNum) {
            customDataMap.set(key, new CustomDataValue(CustomDataType.Num, false, (value as JSON.Num).valueOf()))
        } else if (value.isString) {
            customDataMap.set(key, new CustomDataValue(CustomDataType.Str, false, 0, (value as JSON.Str).valueOf()))
        } else if (value.isNull) {
            customDataMap.set(key, new CustomDataValue(CustomDataType.Null))
        }
    }
    return new NullableCustomData(customDataMap, false)
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

    static fromPBUser(userPB: DVCUser_PB): DVCUser {
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
        const emptyString = ''
        return encodeDVCUser_PB(new DVCUser_PB(
            this.user_id,
            new NullableString(this.email || emptyString, this.email === null),
            new NullableString(this.name || emptyString, this.name === null),
            new NullableString(this.language || emptyString, this.language === null),
            new NullableString(this.country || emptyString, this.country === null),
            new NullableDouble(this.appBuild || 0.0, isNaN(this.appBuild)),
            new NullableString(this.appVersion || emptyString, this.appVersion === null),
            new NullableString(this.deviceModel || emptyString, this.deviceModel === null),
            nullableCustomDataFromJSONObj(this.customData),
            nullableCustomDataFromJSONObj(this.privateCustomData)
        ))
    }

    static fromJSONString(userStr: string): DVCUser {
        const userJSON = JSON.parse(userStr)
        if (!userJSON.isObj) throw new Error('dvcUserFromJSONString not a JSON Object')
        return this.fromJSONObj(userJSON as JSON.Obj)
    }

    static fromUTF8(userStr: Uint8Array): DVCUser {
        const userJSON = JSON.parse(userStr)
        if (!userJSON.isObj) throw new Error('dvcUserFromUTF8 not a JSON Object')
        return this.fromJSONObj(userJSON as JSON.Obj)
    }

    static fromJSONObj(user: JSON.Obj): DVCUser {
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

    static fromUTF8(userBytes: Uint8Array): DVCPopulatedUser {
        return new DVCPopulatedUser(DVCUser.fromUTF8(userBytes))
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

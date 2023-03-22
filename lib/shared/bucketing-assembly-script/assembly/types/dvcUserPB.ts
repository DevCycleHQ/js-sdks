import { DVCUser_PB, encodeDVCUser_PB } from './protobuf-generated/DVCUser_PB'
import { NullableString } from './protobuf-generated/NullableString'
import { NullableDouble } from './protobuf-generated/NullableDouble'
import { CustomDataValue } from './protobuf-generated/CustomDataValue'
import { _getPlatformData } from '../managers/platformDataManager'
import { NullableCustomData } from './protobuf-generated/NullableCustomData'
import { CustomDataType } from './protobuf-generated/CustomDataType'

export class CustomDataValuePB extends CustomDataValue {
    get isString(): bool {
        return this.type === CustomDataType.Str
    }
    get isFloat(): bool {
        return this.type === CustomDataType.Num
    }
    get isBool(): bool {
        return this.type === CustomDataType.Bool
    }
    get isNull(): bool {
        return this.type === CustomDataType.Null
    }

    asString(): string {
        return this.stringValue
    }

    asNumber(): f64 {
        return this.doubleValue
    }
    asBool(): bool {
        return this.boolValue
    }
}

export class DVCUserPB {
    constructor(
        public readonly user_id: string,
        public readonly email: string | null,
        public readonly name: string | null,
        public readonly language: string | null,
        public readonly country: string | null,
        public readonly appBuild: f64,
        public readonly appVersion: string | null,
        public readonly deviceModel: string | null,
        public readonly customData: Map<string, CustomDataValuePB> | null,
        public readonly privateCustomData: Map<string, CustomDataValuePB> | null
    ) {}

    static fromPBUser(userPB: DVCUser_PB): DVCUserPB {
        const nullableEmail = userPB.email
        const nullableName = userPB.name
        const nullableLanguage = userPB.language
        const nullableCountry = userPB.country
        const nullableAppBuild = userPB.appBuild
        const nullableAppVersion = userPB.appVersion
        const nullableDeviceModel = userPB.deviceModel
        const nullableCustomData = userPB.customData
        const nullablePrivateCustomData = userPB.privateCustomData

        return new DVCUserPB(
            userPB.userId,
            (nullableEmail && !nullableEmail.isNull) ? nullableEmail.value : null,
            (nullableName && !nullableName.isNull) ? nullableName.value : null,
            (nullableLanguage && !nullableLanguage.isNull) ? nullableLanguage.value : null,
            (nullableCountry && !nullableCountry.isNull) ? nullableCountry.value : null,
            (nullableAppBuild && !nullableAppBuild.isNull) ? nullableAppBuild.value : NaN,
            (nullableAppVersion && !nullableAppVersion.isNull) ? nullableAppVersion.value : null,
            (nullableDeviceModel && !nullableDeviceModel.isNull) ? nullableDeviceModel.value : null,
            (nullableCustomData && !nullableCustomData.isNull) ? nullableCustomData.value : null,
            (nullablePrivateCustomData && !nullablePrivateCustomData.isNull) ? nullablePrivateCustomData.value : null,
        )
    }

    // This is for tests only
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
            new NullableCustomData(this.customData || new Map<string, CustomDataValuePB>(), this.customData === null),
            new NullableCustomData(this.privateCustomData || new Map<string, CustomDataValuePB>(), this.privateCustomData === null),
        ))
    }
}


export class DVCPopulatedUserPB {
    readonly user_id: string
    readonly email: string | null
    readonly name: string | null
    readonly language: string | null
    readonly country: string | null
    readonly appVersion: string | null
    readonly appBuild: f64
    customData: Map<string, CustomDataValuePB> | null
    privateCustomData: Map<string, CustomDataValuePB> | null
    private _combinedCustomData: Map<string, CustomDataValuePB>
    readonly deviceModel: string | null

    readonly createdDate: Date
    readonly lastSeenDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: string
    readonly sdkVersion: string
    readonly hostname: string | null

    constructor(user: DVCUserPB) {
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

        const combinedCustomData = new Map<string, CustomDataValuePB>()

        const customData = user.customData
        if (customData) {
            const keys = customData.keys()
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                combinedCustomData.set(key, customData.get(key))
            }
        }

        const privateCustomData = user.privateCustomData
        if (privateCustomData) {
            const keys = privateCustomData.keys()
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
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

    getCombinedCustomData(): Map<string, CustomDataValuePB> {
        return this._combinedCustomData
    }

    // mergeClientCustomData(clientCustomData: JSON.Obj): void {
    //     if (!this.customData && clientCustomData.keys.length > 0) {
    //         this.customData = new Map<string, CustomDataValue>
    //     }
    //
    //     for (let i = 0; i < clientCustomData.keys.length; i++) {
    //         if (!this.customData!.has(clientCustomData.keys[i])
    //             && (this.privateCustomData && !this.privateCustomData!.has(clientCustomData.keys[i]))) {
    //             this.customData!.set(clientCustomData.keys[i], clientCustomData.get(clientCustomData.keys[i]))
    //         }
    //     }
    // }
}

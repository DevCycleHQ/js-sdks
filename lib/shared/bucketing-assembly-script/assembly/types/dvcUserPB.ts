import { DVCUser_PB } from './protobuf-generated/DVCUser_PB'
import { NullableString } from './protobuf-generated/NullableString'
import { NullableDouble } from './protobuf-generated/NullableDouble'
import { CustomDataValue } from './protobuf-generated/CustomDataValue'
import { _getPlatformData } from '../managers/platformDataManager'
import { NullableCustomData } from './protobuf-generated/NullableCustomData'
import { CustomDataType } from './protobuf-generated/CustomDataType'

export class CustomDataValueInterpreter {
    static isString(val: CustomDataValue): bool {
        return val.type === CustomDataType.Str
    }
    static isFloat(val: CustomDataValue): bool {
        return val.type === CustomDataType.Num
    }
    static isBool(val: CustomDataValue): bool {
        return val.type === CustomDataType.Bool
    }
    static isNull(val: CustomDataValue): bool {
        return val.type === CustomDataType.Null
    }

    static asString(val: CustomDataValue): string {
        return val.stringValue
    }

    static asNumber(val: CustomDataValue): f64 {
        return val.doubleValue
    }

    static asBool(val: CustomDataValue): bool {
        return val.boolValue
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
    customData: Map<string, CustomDataValue> | null
    privateCustomData: Map<string, CustomDataValue> | null
    readonly deviceModel: string | null

    readonly createdDate: Date
    readonly lastSeenDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: string
    readonly sdkVersion: string
    readonly hostname: string | null

    constructor(user: DVCUser_PB) {
        this.user_id = user.userId
        this.email = deNullString(user.email)
        this.name = deNullString(user.name)
        this.language = deNullString(user.language)
        this.country = deNullString(user.country)
        this.appVersion = deNullString(user.appVersion)
        this.appBuild = deNullDouble(user.appBuild)
        this.customData = deNullCustomData(user.customData)
        this.privateCustomData = deNullCustomData(user.privateCustomData)
        this.deviceModel = deNullString(user.deviceModel)

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

    getCustomDataValue(key: string): CustomDataValue | null {
        return this.privateCustomData && this.privateCustomData!.has(key)
            ? this.privateCustomData!.get(key)
            : (this.customData && this.customData!.has(key)
                ? this.customData!.get(key)
                : null)
    }
}

function deNullString(nullableString: NullableString | null): string | null {
    if (!nullableString || nullableString.isNull) {
        return null
    }
    return nullableString.value
}

function deNullDouble(nullableDouble: NullableDouble | null): f64 {
    if (!nullableDouble || nullableDouble.isNull) {
        return NaN
    }
    return nullableDouble.value
}

function deNullCustomData(nullableCustomData: NullableCustomData | null): Map<string, CustomDataValue> | null {
    if (!nullableCustomData || nullableCustomData.isNull) {
        return null
    }
    return nullableCustomData.value
}

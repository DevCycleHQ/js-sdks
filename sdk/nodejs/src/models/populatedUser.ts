import { DVCJSON } from '../types'
import * as packageJson from '../../package.json'
import { DVCUser } from './user'
import os from 'os'
import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'

export class DVCPopulatedUser implements DVCUser {
    user_id: string
    email?: string
    name?: string
    language?: string
    country?: string
    appVersion?: string
    appBuild?: number
    customData?: DVCJSON
    privateCustomData?: DVCJSON
    readonly lastSeenDate: Date
    readonly createdDate: Date
    readonly platform: string
    readonly platformVersion: string
    readonly sdkType: 'server'
    readonly sdkVersion: string
    readonly hostname: string

    constructor(user: DVCUser) {
        this.user_id = user.user_id
        this.email = user.email
        this.name = user.name
        this.language = user.language
        this.country = user.country
        this.appVersion = user.appVersion
        this.appBuild = user.appBuild
        this.customData = user.customData
        this.privateCustomData = user.privateCustomData
        this.lastSeenDate = new Date()

        /**
         * Read only properties initialized once
         */
        this.createdDate = new Date()
        this.platform = 'NodeJS'
        this.platformVersion = process.version
        this.sdkType = 'server'
        this.sdkVersion = packageJson.version
        this.hostname = os.hostname()
    }

    toPBUser(): ProtobufTypes.DVCUser_PB {
        const params = {
            user_id: this.user_id,
            email: ProtobufTypes.NullableString.create({ value: this.email || '', isNull: !this.email }),
            name: ProtobufTypes.NullableString.create({ value: this.name || '', isNull: !this.name }),
            language: ProtobufTypes.NullableString.create({ value: this.language || '', isNull: !this.language }),
            country: ProtobufTypes.NullableString.create({ value: this.country || '', isNull: !this.country }),
            appBuild: ProtobufTypes.NullableDouble.create({
                value: this.appBuild || 0,
                isNull: this.appBuild === null || this.appBuild === undefined
            }),
            appVersion: ProtobufTypes.NullableString.create({ value: this.appVersion || '', isNull: !this.appVersion }),
            deviceModel: ProtobufTypes.NullableString.create({ value: '', isNull: true }),
            customData: getNullableCustomDataValue(this.customData),
            privateCustomData: getNullableCustomDataValue(this.privateCustomData)
        }
        const err = ProtobufTypes.DVCUser_PB.verify(params)
        if (err) throw new Error(`DVCUser protobuf verification error: ${err}`)

        return ProtobufTypes.DVCUser_PB.create(params)
    }

    static fromDVCUser(user: DVCUser): DVCPopulatedUser {
        return new DVCPopulatedUser(user)
    }
}

export function getNullableCustomDataValue(customData?: DVCJSON): ProtobufTypes.NullableCustomData {
    if (!customData) {
        return ProtobufTypes.NullableCustomData.create({ value: {}, isNull: true })
    }

    const valuesMap = new Map<string, ProtobufTypes.CustomDataValue>()
    for (const key in customData) {
        const value = customData[key]
        if (typeof value === 'boolean') {
            valuesMap.set(
                key,
                ProtobufTypes.CustomDataValue.create({ type: ProtobufTypes.CustomDataType.Bool, boolValue: value })
            )
        } else if (typeof value === 'number') {
            valuesMap.set(
                key,
                ProtobufTypes.CustomDataValue.create({ type: ProtobufTypes.CustomDataType.Num, doubleValue: value })
            )
        } else if (typeof value === 'string') {
            valuesMap.set(
                key,
                ProtobufTypes.CustomDataValue.create({ type: ProtobufTypes.CustomDataType.Str, stringValue: value })
            )
        } else if (value === null || value === undefined) {
            valuesMap.set(
                key,
                ProtobufTypes.CustomDataValue.create({ type: ProtobufTypes.CustomDataType.Null })
            )
        } else {
            throw new Error(`Unknown custom data type for ProtobufTypes.NullableCustomData: ${typeof value}`)
        }
    }
    return ProtobufTypes.NullableCustomData.create({ value: valuesMap, isNull: false })
}

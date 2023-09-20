import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'
import {
    DVCPopulatedUser,
    DevCycleUser,
    DVCCustomDataJSON,
} from '@devcycle/js-cloud-server-sdk'
import { getNodeJSPlatformDetails } from '../utils/platformDetails'

export class DVCPopulatedPBUser extends DVCPopulatedUser {
    constructor(user: DevCycleUser) {
        super(user, getNodeJSPlatformDetails())
    }

    toPBUser(): ProtobufTypes.DVCUser_PB {
        const params = {
            user_id: super.user_id,
            email: ProtobufTypes.NullableString.create({
                value: super.email || '',
                isNull: !super.email,
            }),
            name: ProtobufTypes.NullableString.create({
                value: super.name || '',
                isNull: !super.name,
            }),
            language: ProtobufTypes.NullableString.create({
                value: super.language || '',
                isNull: !super.language,
            }),
            country: ProtobufTypes.NullableString.create({
                value: super.country || '',
                isNull: !super.country,
            }),
            appBuild: ProtobufTypes.NullableDouble.create({
                value: super.appBuild || 0,
                isNull: super.appBuild === null || super.appBuild === undefined,
            }),
            appVersion: ProtobufTypes.NullableString.create({
                value: super.appVersion || '',
                isNull: !super.appVersion,
            }),
            deviceModel: ProtobufTypes.NullableString.create({
                value: '',
                isNull: true,
            }),
            customData: getNullableCustomDataValue(super.customData),
            privateCustomData: getNullableCustomDataValue(
                super.privateCustomData,
            ),
        }
        const err = ProtobufTypes.DVCUser_PB.verify(params)
        if (err) throw new Error(`DVCUser protobuf verification error: ${err}`)

        return ProtobufTypes.DVCUser_PB.create(params)
    }

    static fromDVCUser(user: DevCycleUser): DVCPopulatedPBUser {
        return new DVCPopulatedPBUser(user)
    }
}

export function getNullableCustomDataValue(
    customData?: DVCCustomDataJSON,
): ProtobufTypes.NullableCustomData {
    if (!customData) {
        return ProtobufTypes.NullableCustomData.create({
            value: {},
            isNull: true,
        })
    }

    const valuesMap: Record<string, ProtobufTypes.CustomDataValue> = {}
    for (const key in customData) {
        const value = customData[key]
        if (typeof value === 'boolean') {
            valuesMap[key] = ProtobufTypes.CustomDataValue.create({
                type: ProtobufTypes.CustomDataType.Bool,
                boolValue: value,
            })
        } else if (typeof value === 'number') {
            valuesMap[key] = ProtobufTypes.CustomDataValue.create({
                type: ProtobufTypes.CustomDataType.Num,
                doubleValue: value,
            })
        } else if (typeof value === 'string') {
            valuesMap[key] = ProtobufTypes.CustomDataValue.create({
                type: ProtobufTypes.CustomDataType.Str,
                stringValue: value,
            })
        } else if (value === null || value === undefined) {
            valuesMap[key] = ProtobufTypes.CustomDataValue.create({
                type: ProtobufTypes.CustomDataType.Null,
            })
        } else {
            throw new Error(
                `Unknown custom data type for ProtobufTypes.NullableCustomData: ${typeof value}`,
            )
        }
    }
    return ProtobufTypes.NullableCustomData.create({
        value: valuesMap,
        isNull: false,
    })
}

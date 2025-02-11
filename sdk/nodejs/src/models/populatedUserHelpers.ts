import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'
import {
    DVCPopulatedUser,
    DevCycleUser,
    DVCCustomDataJSON,
    DevCyclePlatformDetails,
} from '@devcycle/js-cloud-server-sdk'
import { getNodeJSPlatformDetails } from '../utils/platformDetails'

export function DVCPopulatedUserToPBUser(
    user: DevCycleUser,
): ProtobufTypes.DVCUser_PB {
    const params = {
        user_id: user.user_id,
        email: ProtobufTypes.NullableString.create({
            value: user.email || '',
            isNull: !user.email,
        }),
        name: ProtobufTypes.NullableString.create({
            value: user.name || '',
            isNull: !user.name,
        }),
        language: ProtobufTypes.NullableString.create({
            value: user.language || '',
            isNull: !user.language,
        }),
        country: ProtobufTypes.NullableString.create({
            value: user.country || '',
            isNull: !user.country,
        }),
        appBuild: ProtobufTypes.NullableDouble.create({
            value: user.appBuild || 0,
            isNull: user.appBuild === null || user.appBuild === undefined,
        }),
        appVersion: ProtobufTypes.NullableString.create({
            value: user.appVersion || '',
            isNull: !user.appVersion,
        }),
        deviceModel: ProtobufTypes.NullableString.create({
            value: '',
            isNull: true,
        }),
        customData: getNullableCustomDataValue(user.customData),
        privateCustomData: getNullableCustomDataValue(user.privateCustomData),
    }
    const err = ProtobufTypes.DVCUser_PB.verify(params)
    if (err) throw new Error(`DVCUser protobuf verification error: ${err}`)

    return ProtobufTypes.DVCUser_PB.create(params)
}

export function DVCPopulatedUserFromDevCycleUser(
    user: DevCycleUser,
    platformDetails?: DevCyclePlatformDetails,
): DVCPopulatedUser {
    return new DVCPopulatedUser(
        user,
        platformDetails || getNodeJSPlatformDetails(),
    )
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

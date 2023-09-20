/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DevCycleUser } from '../../src/models/user'
import {
    DVCPopulatedUser,
    getNullableCustomDataValue,
} from '../../src/models/populatedPBUser'
import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'

describe('DVCUser', () => {
    describe('validation tests', () => {
        it('should throw error if user_id is missing', () => {
            expect(() => new (DevCycleUser as any)({})).toThrow(
                'Must have a user_id set on the user',
            )
            expect(() => new (DevCycleUser as any)({ user_id: '' })).toThrow(
                'Must have a user_id set on the user',
            )
            expect(() => new (DevCycleUser as any)({ user_id: 8 })).toThrow(
                'user_id is not of type: string',
            )
        })
        it('should throw an error if user_id is greater than 200 characters', () => {
            expect(
                () =>
                    new (DevCycleUser as any)({
                        user_id:
                            'Oy0mkUHONE6Qg36DhrOrwbvkCaxiMQPClHsELgFdfdlYCcE0AGyJqgl2tnV6Ago2\
                        7uUXlXvChzLiLHPGRDavA9H82lM47B1pFOW51KQhT9kxLU1PgLfs2NOlekOWldtT9jh\
                        JdgsDl0Cm49Vb7utlc4y0dyHYS1GKFuJwuipzVSrlYij39D8BWKLDbkqiJGc7qU2xCAeJv',
                    }),
            ).toThrow('user_id cannot be longer than 200 characters')
        })
    })

    describe('protobuf tests', () => {
        it('should format a protobuf user correctly', () => {
            const customData = {
                strKey: 'string',
                numKey: 2056,
                boolKey: false,
                nullKey: null,
            }
            const dvcUser = new DVCPopulatedUser(
                new DevCycleUser({
                    user_id: 'user_id',
                    email: 'email',
                    name: 'name',
                    language: 'en',
                    country: 'US',
                    appVersion: '1.0.0',
                    appBuild: 111,
                    // @ts-ignore
                    customData,
                    // @ts-ignore
                    privateCustomData: customData,
                }),
            )
            const expectedCustomData = {
                isNull: false,
                value: {
                    boolKey: {
                        boolValue: false,
                        type: 'Bool',
                    },
                    nullKey: {
                        type: 'Null',
                    },
                    numKey: {
                        doubleValue: 2056,
                        type: 'Num',
                    },
                    strKey: {
                        stringValue: 'string',
                        type: 'Str',
                    },
                },
            }

            const pbUser = dvcUser.toPBUser()
            const buffer = ProtobufTypes.DVCUser_PB.encode(pbUser).finish()
            expect(buffer).not.toBeNull()
            const decodedUser = ProtobufTypes.DVCUser_PB.decode(buffer)
            expect(decodedUser.toJSON()).toEqual(
                expect.objectContaining({
                    user_id: 'user_id',
                    appBuild: {
                        isNull: false,
                        value: 111,
                    },
                    appVersion: {
                        isNull: false,
                        value: '1.0.0',
                    },
                    country: {
                        isNull: false,
                        value: 'US',
                    },
                    deviceModel: {
                        isNull: true,
                        value: '',
                    },
                    email: {
                        isNull: false,
                        value: 'email',
                    },
                    language: {
                        isNull: false,
                        value: 'en',
                    },
                    name: {
                        isNull: false,
                        value: 'name',
                    },
                }),
            )
            expect(decodedUser.customData.toJSON()).toEqual(expectedCustomData)
            expect(decodedUser.privateCustomData.toJSON()).toEqual(
                expectedCustomData,
            )
        })

        it('should format customData protobuf correctly', () => {
            const customData = {
                strKey: 'string',
                numKey: 2056,
                boolKey: false,
                nullKey: null,
            }
            // @ts-ignore
            const pbCustomData = getNullableCustomDataValue(customData)
            const buffer =
                ProtobufTypes.NullableCustomData.encode(pbCustomData).finish()
            expect(buffer).not.toBeNull()
            const decodedCustomData =
                ProtobufTypes.NullableCustomData.decode(buffer)
            expect(decodedCustomData.toJSON()).toEqual({
                isNull: false,
                value: {
                    boolKey: {
                        boolValue: false,
                        type: 'Bool',
                    },
                    nullKey: {
                        type: 'Null',
                    },
                    numKey: {
                        doubleValue: 2056,
                        type: 'Num',
                    },
                    strKey: {
                        stringValue: 'string',
                        type: 'Str',
                    },
                },
            })
        })

        it('should format customDataValue protobuf correctly', () => {
            const stringCDValue = ProtobufTypes.CustomDataValue.create({
                type: ProtobufTypes.CustomDataType.Str,
                stringValue: 'string-value',
            })
            const buffer =
                ProtobufTypes.CustomDataValue.encode(stringCDValue).finish()
            expect(buffer).not.toBeNull()
            const decodedCustomDataValue =
                ProtobufTypes.CustomDataValue.decode(buffer)
            expect(decodedCustomDataValue.toJSON()).toEqual({
                stringValue: 'string-value',
                type: 'Str',
            })
        })
    })
})

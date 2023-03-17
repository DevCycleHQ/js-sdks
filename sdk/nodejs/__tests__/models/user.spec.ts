/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DVCUser } from '../../src/models/user'
import { DVCPopulatedUser, getNullableCustomDataValue } from '../../src/models/populatedUser'
import { ProtobufTypes } from '@devcycle/bucketing-assembly-script'

describe('DVCUser', () => {
    describe('validation tests', () => {
        it('should throw error if user_id is missing', () => {
            expect(() => new (DVCUser as any)({})).toThrow('Must have a user_id set on the user')
            expect(() => new (DVCUser as any)({ user_id: '' })).toThrow('Must have a user_id set on the user')
            expect(() => new (DVCUser as any)({ user_id: 8 })).toThrow('user_id is not of type: string')
        })
        it('should throw an error if user_id is greater than 200 characters', () => {
            expect(() => new(DVCUser as any)({
                user_id: 'Oy0mkUHONE6Qg36DhrOrwbvkCaxiMQPClHsELgFdfdlYCcE0AGyJqgl2tnV6Ago2\
                        7uUXlXvChzLiLHPGRDavA9H82lM47B1pFOW51KQhT9kxLU1PgLfs2NOlekOWldtT9jh\
                        JdgsDl0Cm49Vb7utlc4y0dyHYS1GKFuJwuipzVSrlYij39D8BWKLDbkqiJGc7qU2xCAeJv'
            })).toThrow('user_id cannot be longer than 200 characters')
        })
    })

    describe('protobuf tests', () => {
        it('should format a protobuf user correctly', () => {
            const dvcUser = new DVCPopulatedUser(new DVCUser({
                user_id: 'user_id',
                email: 'email',
                name: 'name',
                languagen: 'en',
                country: 'US',
                appVersion: '1.0.0',
                appBuild: 111,
                // @ts-ignore
                customData: { strKey: 'string', numKey: 2056, boolKey: false, nullKey: null },
                // @ts-ignore
                privateCustomData: { strKey: 'string', numKey: 2056, boolKey: false, nullKey: null }
            }))
            const pbUser = dvcUser.toPBUser()
            const buffer = ProtobufTypes.DVCUser_PB.encode(pbUser).finish()
            expect(buffer).not.toBeNull()
            const decodedUser = ProtobufTypes.DVCUser_PB.decode(buffer)
            expect(decodedUser.toJSON()).toEqual(expect.objectContaining({
                'user_id': 'user_id',
                'appBuild':  {
                    'isNull': false,
                    'value': 111,
                },
                'appVersion':  {
                    'isNull': false,
                    'value': '1.0.0',
                },
                'country':  {
                    'isNull': false,
                    'value': 'US',
                },
                'deviceModel':  {
                    'isNull': true,
                    'value': '',
                },
                'email':  {
                    'isNull': false,
                    'value': 'email',
                },
                'language':  {
                    'isNull': true,
                    'value': '',
                },
                'name':  {
                    'isNull': false,
                    'value': 'name',
                },
            }))
            expect(decodedUser.customData.toJSON()).toEqual({})
            expect(decodedUser.privateCustomData.toJSON()).toEqual({})
        })

        it('should format customData protobuf correctly', () => {
            const customData = { strKey: 'string', numKey: 2056, boolKey: false, nullKey: null }
            const pbCustomData = getNullableCustomDataValue(customData)
        })
    })
})

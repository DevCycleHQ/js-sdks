/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DevCycleUser } from '../../src/models/user'

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
})

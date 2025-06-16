import { VariableType } from './bucketingImportHelper'
import {
    initSDK,
    variableForUser,
    variableForUserPreallocated,
} from './variableSetupHelper'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData

describe('variableForUser tests', () => {
    beforeAll(() => initSDK())

    it('generates variable object for user', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test',
        }
        const variable1 = variableForUser({
            config,
            user,
            variableKey: 'swagTest',
            variableType: VariableType.String,
        })
        expect(variable1).toEqual({
            _id: '615356f120ed334a6054564c',
            _feature: '614ef6aa473928459060721a',
            eval: {
                details: 'User ID AND Country',
                reason: 'TARGETING_MATCH',
            },
            key: 'swagTest',
            type: 'String',
            value: 'YEEEEOWZA',
        })
        const variable2 = variableForUser({
            config,
            user,
            variableKey: 'bool-var',
            variableType: VariableType.Boolean,
        })
        expect(variable2).toEqual({
            _id: '61538237b0a70b58ae6af71y',
            _feature: '614ef6aa473928459060721a',
            eval: {
                details: 'User ID AND Country',
                reason: 'TARGETING_MATCH',
            },
            key: 'bool-var',
            type: 'Boolean',
            value: false,
        })
        const variable3 = variableForUser({
            config,
            user,
            variableKey: 'num-var',
            variableType: VariableType.Number,
        })
        expect(variable3).toEqual({
            _id: '61538237b0a70b58ae6af71s',
            _feature: '614ef6aa473928459060721a',
            eval: {
                details: 'User ID AND Country',
                reason: 'TARGETING_MATCH',
            },
            key: 'num-var',
            type: 'Number',
            value: 610.61,
        })
        const variable4 = variableForUser({
            config,
            user,
            variableKey: 'json-var',
            variableType: VariableType.JSON,
        })
        expect(variable4).toEqual({
            _id: '61538237b0a70b58ae6af71q',
            _feature: '614ef6aa473928459060721a',
            eval: {
                details: 'User ID AND Country',
                reason: 'TARGETING_MATCH',
            },
            key: 'json-var',
            type: 'JSON',
            value: '{"hello":"world","num":610,"bool":true}',
        })
    })

    it('generates variable object for user using preallocated memory', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test',
        }
        const variable1 = variableForUserPreallocated({
            config,
            user,
            variableKey: 'swagTest',
            variableType: VariableType.String,
        })
        expect(variable1).toEqual({
            _id: '615356f120ed334a6054564c',
            _feature: '614ef6aa473928459060721a',
            eval: {
                details: 'User ID AND Country',
                reason: 'TARGETING_MATCH',
            },
            key: 'swagTest',
            type: 'String',
            value: 'YEEEEOWZA',
        })
    })

    it("returns null if variable type isn't correct", () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test',
        }
        const variable = variableForUser({
            config,
            user,
            variableKey: 'swagTest',
            variableType: VariableType.Number,
        })
        expect(variable).toBeNull()
    })

    it('returns null if variable does not exist', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test',
        }
        const variable = variableForUser({
            config,
            user,
            variableKey: 'unknownKey',
            variableType: VariableType.String,
        })
        expect(variable).toBeNull()
    })
})

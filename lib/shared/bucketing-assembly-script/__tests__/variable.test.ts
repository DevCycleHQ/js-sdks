import {
    setPlatformData,
    setConfigData,
    variableForUser as variableForUser_AS,
    initEventQueue,
    VariableType
} from './bucketingImportHelper'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
import { SDKVariable } from '../assembly/types'
const { config } = testData

const variableForUser = (
    { config, user, variableKey, variableType }:
    { config: unknown, user: unknown, variableKey: string, variableType: VariableType }
): SDKVariable | null => {
    setConfigData('sdkKey', JSON.stringify(config))
    const variableJSON = variableForUser_AS('sdkKey', JSON.stringify(user), variableKey, variableType, true)
    return variableJSON ? JSON.parse(variableJSON) as SDKVariable : null
}

const initSDK = () => {
    const sdkKey = 'sdkKey'
    initEventQueue(sdkKey as string, JSON.stringify({}))
    setPlatformData(JSON.stringify({
        platform: 'NodeJS',
        platformVersion: '16.0',
        sdkType: 'server',
        sdkVersion: '1.0.0',
        hostname: 'host.name'
    }))
    setConfigData(sdkKey, JSON.stringify(config))
}

describe('variableForUser tests', () => {
    beforeAll(() => initSDK())

    it('generates variable object for user', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test'
        }
        const variable1 = variableForUser({ config, user, variableKey: 'swagTest', variableType: VariableType.String })
        expect(variable1).toEqual({
            _id: '615356f120ed334a6054564c',
            key: 'swagTest',
            type: 'String',
            value: 'YEEEEOWZA',
        })
        const variable2 = variableForUser({ config, user, variableKey: 'bool-var', variableType: VariableType.Boolean })
        expect(variable2).toEqual({
            _id: '61538237b0a70b58ae6af71y',
            key: 'bool-var',
            type: 'Boolean',
            value: false,
        })
        const variable3 = variableForUser({ config, user, variableKey: 'num-var', variableType: VariableType.Number })
        expect(variable3).toEqual({
            _id: '61538237b0a70b58ae6af71s',
            key: 'num-var',
            type: 'Number',
            value: 610.610,
        })
        const variable4 = variableForUser({ config, user, variableKey: 'json-var', variableType: VariableType.JSON })
        expect(variable4).toEqual({
            _id: '61538237b0a70b58ae6af71q',
            key: 'json-var',
            type: 'JSON',
            value: '{"hello":"world","num":610,"bool":true}',
        })
    })

    it('returns null if variable type isn\'t correct', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test'
        }
        const variable = variableForUser({ config, user, variableKey: 'swagTest', variableType: VariableType.Number })
        expect(variable).toBeNull()
    })

    it('returns null if variable does not exist', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test'
        }
        const variable = variableForUser({ config, user, variableKey: 'unknownKey', variableType: VariableType.String })
        expect(variable).toBeNull()
    })
})

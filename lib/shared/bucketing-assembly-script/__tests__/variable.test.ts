import {
    setPlatformData,
    setConfigData,
    variableForUser as variableForUser_AS,
    initEventQueue
} from './bucketingImportHelper'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
import { SDKVariable } from '../assembly/types'
const { config } = testData

const variableForUser = (
    { config, user, variableKey, variableType }:
    { config: unknown, user: unknown, variableKey: string, variableType: string }
): SDKVariable | null => {
    setConfigData('sdkKey', JSON.stringify(config))
    const variableJSON = variableForUser_AS('sdkKey', JSON.stringify(user), variableKey, variableType)
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
        const variable = variableForUser({ config, user, variableKey: 'swagTest', variableType: 'String' })
        expect(variable).toEqual({
            _id: '615356f120ed334a6054564c',
            key: 'swagTest',
            type: 'String',
            value: 'YEEEEOWZA',
        })
    })

    it('returns null if variable does not exist', () => {
        const user = {
            country: 'canada',
            user_id: 'asuh',
            email: 'test'
        }
        const variable = variableForUser({ config, user, variableKey: 'unknownKey', variableType: 'String' })
        expect(variable).toBeNull()
    })
})

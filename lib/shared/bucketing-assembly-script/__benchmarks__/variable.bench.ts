import { benchmarkSuite } from 'jest-bench'
import {
    cleanupSDK,
    initSDK,
    variableForUser,
    variableForUser_PB
} from '../__tests__/variableSetupHelper'
import { ConfigBody } from '@devcycle/types'
import {
    initialize,
    VariableType,
    initEventQueue,
    setPlatformData,
    setConfigData,
    generateBucketedConfigForUser,
    setClientCustomData
} from '../__tests__/bucketingImportHelper'
import largeTestData from '@devcycle/bucketing-test-data/json-data/largeConfig.json'
import testData from '@devcycle/bucketing-test-data/json-data/testData.json'
const { config } = testData

const largeConfig = largeTestData.largeConfig as unknown as ConfigBody

const user = {
    user_id: 'asuh',
    email: 'test@email.com',
    country: 'CA'
}
const largeUser = {
    user_id: 'asuh',
    email: 'test@email.com',
    name: 'very long name that is longer than 50 characters long',
    language: 'en',
    country: 'CA',
    appVersion: '122222222.10.23423423',
    appBuild: 987654321,
    customData: { 'very long key that is longer than 50 characters long': 'very long value that is longer than 50 characters long', 'longKey2': 123421423 },
    privateCustomData: { 'very long key that is longer than 50 characters long': 'very long value that is longer than 50 characters long', 'longKey2': 123421423 },
}
const defaultUser = { user_id: 'default' }
const largeConfigUser = {
    user_id: 'user_431a7ba3-32a2-40e8-ac42-ed2934422a5b'
}

benchmarkSuite('variableForUser', {
    async setupSuite() {
        console.log('setup variableForUser tests')
        await initialize(true)
        initSDK()
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['variableForUser']: () => {
        const variable = variableForUser({
            user, variableKey: 'swagTest', variableType: VariableType.String
        })
        if (!variable) throw new Error('variable should not be defaulted')
    },
    ['variableForUser_PB']: () => {
        const variable = variableForUser_PB({
            user, variableKey: 'swagTest', variableType: VariableType.String
        })
        if (!variable) throw new Error('variable should not be defaulted')
    },
    ['variableForUser - large user']: () => {
        const variable = variableForUser({
            user: largeUser, variableKey: 'swagTest', variableType: VariableType.String
        })
        if (!variable) throw new Error('variable should not be defaulted')
    },
    ['variableForUser_PB - large user']: () => {
        const variable = variableForUser_PB({
            user: largeUser, variableKey: 'swagTest', variableType: VariableType.String
        })
        if (!variable) throw new Error('variable should not be defaulted')
    },
    ['variableForUser - defaulted']: () => {
        const variable = variableForUser({
            user: defaultUser, variableKey: 'swagTest', variableType: VariableType.String
        })
        if (variable) throw new Error('variable should be defaulted')
    },
    ['variableForUser_PB - defaulted']: () => {
        const variable = variableForUser_PB({
            user: defaultUser, variableKey: 'swagTest', variableType: VariableType.String
        })
        if (variable) throw new Error('variable should be defaulted')
    },
    ['variableForUser - unknown key']: () => {
        const variable = variableForUser({
            user: defaultUser, variableKey: 'unknown key', variableType: VariableType.String
        })
        if (variable) throw new Error('variable should be defaulted')
    },
    ['variableForUser_PB - unknown key']: () => {
        const variable = variableForUser_PB({
            user: defaultUser, variableKey: 'unknown key', variableType: VariableType.String
        })
        if (variable) throw new Error('variable should be defaulted')
    },
})

benchmarkSuite('variableForUser - Large Config', {
    async setupSuite() {
        console.log('setup variableForUser - Large Config tests')
        await initialize(true)
        // @ts-ignore
        initSDK('sdkKey', largeConfig)
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['variableForUser']: () => {
        const variable = variableForUser({
            user: largeConfigUser, variableKey: 'v-key-50', variableType: VariableType.Boolean
        })
        if (!variable) throw new Error('variable should not be defaulted')
    },
    ['variableForUser_PB']: () => {
        const variable = variableForUser_PB({
            user: largeConfigUser, variableKey: 'v-key-50', variableType: VariableType.Boolean
        })
        if (!variable) throw new Error('variable should not be defaulted')
    }
})

benchmarkSuite('generateBucketedConfigForUser', {
    async setupSuite() {
        console.log('setup generateBucketedConfigForUser tests')
        await initialize(true)
        initSDK()
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['generateBucketedConfigForUser']: () => {
        generateBucketedConfigForUser('sdkKey', JSON.stringify(user))
    },
    ['generateBucketedConfigForUser - large user']: () => {
        generateBucketedConfigForUser('sdkKey', JSON.stringify(largeConfigUser))
    },
})

benchmarkSuite('generateBucketedConfigForUser - Large Config', {
    async setupSuite() {
        console.log('setup generateBucketedConfigForUser - Large Config tests')
        await initialize(true)
        // @ts-ignore
        initSDK('sdkKey', largeConfig)
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['generateBucketedConfigForUser']: () => {
        generateBucketedConfigForUser('sdkKey', JSON.stringify(user))
    },
    ['generateBucketedConfigForUser - large user']: () => {
        generateBucketedConfigForUser('sdkKey', JSON.stringify(largeConfigUser))
    },
})

let i = 0

benchmarkSuite('initEventQueue', {
    async setupSuite() {
        console.log('setup initEventQueue tests')
        await initialize(true)
        initSDK('sdkKey')
        i = 0
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['initEventQueue']: () => {
        initEventQueue('sdkKey_' + i, JSON.stringify({}))
        i++
    }
})

benchmarkSuite('setPlatformData', {
    async setupSuite() {
        console.log('setup setPlatformData tests')
        await initialize(true)
        initSDK('sdkKey')
        i = 0
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['setPlatformData']: () => {
        setPlatformData(JSON.stringify({
            platform: 'NodeJS',
            platformVersion: '16.0',
            sdkType: 'server',
            sdkVersion: '1.0.' + i,
            hostname: 'host.name'
        }))
        i++
    }
})

benchmarkSuite('setConfigData', {
    async setupSuite() {
        console.log('setup setConfigData tests')
        await initialize(true)
        initSDK('sdkKey')
        i = 0
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['setConfigData - small']: () => {
        setConfigData('sdkKey_' + i, JSON.stringify(config))
        i++
    },
    ['setConfigData - large']: () => {
        setConfigData('sdkKey_' + i, JSON.stringify(largeConfig))
        i++
    }
})

benchmarkSuite('setClientCustomData', {
    async setupSuite() {
        console.log('setup setClientCustomData tests')
        await initialize(true)
        initSDK('sdkKey')
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['setClientCustomData - small']: () => {
        setClientCustomData('sdkKey', JSON.stringify(largeUser.customData))
    }
})

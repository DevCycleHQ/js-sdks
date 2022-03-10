/**
 * Example NodeJS script to execute WebAssembly package
 */
const {
    generateBucketedConfig, __newString, __getString
} = require('./asModule')

const config = {
    project: { _id: '_project', key: 'projectKey' },
    environment: { _id: 'environment', key: 'envKey' }
}
const user = {
    user_id: 'test_id'
}

const configStr = JSON.stringify(config)
const userStr = JSON.stringify(user)
try {
    const result = generateBucketedConfig(
        __newString(configStr),
        __newString(userStr)
    )
    console.log('result: ' + __getString(result))
} catch(ex) {
    console.error(ex)
}

import fs from 'fs'
import path from 'path'
import * as testData from './data/testData'
import * as largeTestData from './data/largeConfig'

const folderName = 'lib/shared/bucketing-test-data/json-data/'
const folderPath = path.resolve(process.env.NX_WORKSPACE_ROOT || '', folderName)
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
}

fs.writeFileSync(
    path.resolve(folderPath, 'testData.json'),
    JSON.stringify(testData),
)

fs.writeFileSync(
    path.resolve(folderPath, 'largeConfig.json'),
    JSON.stringify(largeTestData),
)

console.log(`Wrote test data to ${folderPath}`)

export * from './data/testData'
export * from './data/largeConfig'

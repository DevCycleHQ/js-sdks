import { DVCClient, initialize } from '@devcycle/nodejs-server-sdk'
import { DVCClientAPIUser } from '@devcycle/types'
import { plainToInstance } from 'class-transformer'
import { Query } from 'express-serve-static-core'
import express from 'express'
import bodyParser from 'body-parser'
import { promisify } from 'util'

const DVC_SERVER_SDK_KEY = process.env['DVC_SERVER_SDK_KEY'] || '<YOUR_DVC_SERVER_SDK_KEY>'

const app = express()
const port = 5001
const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let dvcClient: DVCClient

function validateUserFromQueryParams(queryParams: Query): DVCClientAPIUser {
    if (!queryParams) {
        throw new Error('Invalid query parameters')
    }

    const user = plainToInstance(DVCClientAPIUser, queryParams || {})
    if (!user.user_id) {
        throw new Error('user_id must be defined')
    }
    return user
}

async function startDVC() {
    dvcClient = await initialize(DVC_SERVER_SDK_KEY, { logLevel: 'info' }).onClientInitialized()
    console.log('DVC Local Bucketing TypeScript Client Initialized')

    const user = {
        user_id: 'node_sdk_test',
        country: 'CA'
    }

    const partyTime = dvcClient.variable(user, 'elliot-test', false)
    if (partyTime.value) {
        const invitation = dvcClient.variable(
            user,
            'invitation-message',
            'My birthday has been cancelled this year'
        )
        console.log('Hi there, we\'ve been friends for a long time so I thought I would tell you personally: \n')
        console.log(invitation.value)
        const event = {
            'type': 'customType',
            'target': invitation.key,
            'date': Date.now()
        }
        try {
            dvcClient.track(user, event)
        } catch (e) {
            console.error(e)
        }
    }

    const defaultVariable = dvcClient.variable(user, 'not-real', true)
    console.log(`Value of the variable is ${defaultVariable.value} \n`)
    const variables = dvcClient.allVariables(user)
    console.log('Variables: ')
    console.dir(variables)
    const features = dvcClient.allFeatures(user)
    console.log('Features: ')
    console.dir(features)
}

async function benchDVC() {
    if (!dvcClient) {
        console.log('start bench')
        dvcClient = await initialize(DVC_SERVER_SDK_KEY, {
            logLevel: 'debug',
            enableCloudBucketing: false,
            disableAutomaticEventLogging: true,
            reporter: {
                reportMetric: (report) => {
                    console.log(report)
                },
                reportFlushResults: (report) => {
                    console.log(report)
                }
            }
        }).onClientInitialized()
    }

    // console.log('wait 3 seconds')
    await promisify(setTimeout)(500)
    // console.log('finished waiting 0.5 seconds')

    const user = {
        user_id: '4807c61a2a922081',
        country: 'CA',
        customData: { 'customDataKey': 'customDataValue', num: 610, bool: false },
        privateCustomData: { 'customDataKey': 'customDataValue', num: 610, bool: false }
    }
    let variable
    const time = performance.now()
    const count = 50000

    for (let i = 0; i < count; i++) {
        variable = dvcClient.variable(user, 'changing-theme-allowed', false)
    }

    const endTime = performance.now() - time
    console.log(
        `Variable 'v-key-25' value is ${variable?.value}, defaulted: ${variable?.isDefaulted}, ` +
        `total: ${endTime}ms, per call: ${endTime / count}ms`
    )

    if (process.env.DVC_BENCH_LOOP) {
        benchDVC()
    }
}

if (process.env.DVC_BENCHMARK) {
    benchDVC()
} else {
    startDVC()
}

app.get('/variables', (req: express.Request, res: express.Response) => {
    const user = validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(dvcClient.allVariables(user)))
})

app.get('/features', (req: express.Request, res: express.Response) => {
    const user = validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(dvcClient.allFeatures(user)))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

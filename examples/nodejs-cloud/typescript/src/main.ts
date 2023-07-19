import {
    DevCycleCloudClient,
    initializeDevCycle,
    DevCycleUser,
} from '@devcycle/nodejs-server-sdk'
import { DVCClientAPIUser } from '@devcycle/types'
import { plainToInstance } from 'class-transformer'
import { Query } from 'express-serve-static-core'
import express from 'express'
import bodyParser from 'body-parser'

const DEVCYCLE_SERVER_SDK_KEY =
    process.env['DEVCYCLE_SERVER_SDK_KEY'] || '<DEVCYCLE_SERVER_SDK_KEY>'
let devcycleClient: DevCycleCloudClient

async function startDevCycle() {
    devcycleClient = initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY, {
        logLevel: 'info',
        enableCloudBucketing: true,
    })
    console.log('DevCycle Cloud Bucketing TypeScript Client Ready')

    const user = {
        user_id: 'node_sdk_test',
        country: 'CA',
    }

    const partyTime = await devcycleClient.variableValue(
        user,
        'elliot-test',
        false,
    )
    if (partyTime) {
        const invitation = await devcycleClient.variable(
            user,
            'invitation-message',
            'My birthday has been cancelled this year',
        )
        console.log(
            "Hi there, we've been friends for a long time so I thought I would tell you personally: \n",
        )
        console.log(invitation.value)
        const event = {
            type: 'customType',
            target: invitation.key,
            date: Date.now(),
        }
        try {
            await devcycleClient.track(user, event)
        } catch (e) {
            console.error(e)
        }
    }

    const defaultVariable = await devcycleClient.variableValue(
        user,
        'not-real',
        true,
    )
    console.log(`Value of the variable is ${defaultVariable} \n`)
    const variables = await devcycleClient.allVariables(user)
    console.log('Variables: ')
    console.dir(variables)
    const features = await devcycleClient.allFeatures(user)
    console.log('Features: ')
    console.dir(features)
}

startDevCycle()

const app = express()
const port = 5001
const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

async function validateUserFromQueryParams(
    queryParams: Query,
): Promise<DevCycleUser> {
    if (!queryParams) {
        throw new Error('Invalid query parameters')
    }

    const user = plainToInstance(DVCClientAPIUser, queryParams || {})
    if (!user.user_id) {
        throw new Error('user_id must be defined')
    }
    return user
}

app.get('/variables', async (req: express.Request, res: express.Response) => {
    const user = await validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(await devcycleClient.allVariables(user)))
})

app.get('/features', async (req: express.Request, res: express.Response) => {
    const user = await validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(await devcycleClient.allFeatures(user)))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

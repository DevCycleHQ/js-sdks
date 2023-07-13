import { DevCycleClient, initializeDevCycle } from '@devcycle/nodejs-server-sdk'
import { DVCClientAPIUser } from '@devcycle/types'
import { plainToInstance } from 'class-transformer'
import { Query } from 'express-serve-static-core'
import express from 'express'
import bodyParser from 'body-parser'
import { benchmarkDevCycle } from './benchmarkDVC'

const DEVCYCLE_SERVER_SDK_KEY =
    process.env['DEVCYCLE_SERVER_SDK_KEY'] || '<DEVCYCLE_SERVER_SDK_KEY>'
let devcycleClient: DevCycleClient

async function startDevCycle() {
    devcycleClient = await initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY, {
        logLevel: 'info',
    }).onClientInitialized()
    console.log('DevCycle local bucketing typescript client initialized')

    const user = {
        user_id: 'node_sdk_test',
        country: 'CA',
    }

    const partyTime = devcycleClient.variableValue(user, 'party-time', false)
    if (partyTime) {
        const invitation = devcycleClient.variable(
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
            devcycleClient.track(user, event)
        } catch (e) {
            console.error(e)
        }
    }

    const defaultVariable = devcycleClient.variableValue(user, 'not-real', true)
    console.log(`Value of the variable is ${defaultVariable} \n`)
    const variables = devcycleClient.allVariables(user)
    console.log('Variables: ')
    console.dir(variables)
    const features = devcycleClient.allFeatures(user)
    console.log('Features: ')
    console.dir(features)
}

if (process.env.DVC_BENCHMARK) {
    benchmarkDevCycle()
} else {
    startDevCycle()
}

// Start express example server
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

app.get('/variables', (req: express.Request, res: express.Response) => {
    const user = validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(devcycleClient.allVariables(user)))
})

app.get('/features', (req: express.Request, res: express.Response) => {
    const user = validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(devcycleClient.allFeatures(user)))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

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

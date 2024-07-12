import { DevCycleClient, initializeDevCycle } from '@devcycle/nodejs-server-sdk'
import { DVCClientAPIUser } from '@devcycle/types'
import { plainToInstance } from 'class-transformer'
import express from 'express'
import { benchmarkDevCycle } from './benchmarkDVC'

const DEVCYCLE_SERVER_SDK_KEY =
    process.env['DEVCYCLE_SERVER_SDK_KEY'] || '<DEVCYCLE_SERVER_SDK_KEY>'
let devcycleClient: DevCycleClient

const TURSO_DATABASE_URL = process.env['TURSO_DATABASE_URL']
const TURSO_AUTH_TOKEN = process.env['TURSO_AUTH_TOKEN']
if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined')
}

type TursoClient = {
    sync: () => Promise<void>
} // Declare Client type locally
let tursoClient: TursoClient

async function startTurso() {
    if (tursoClient) return

    const libsqlModule = await import('@libsql/client/node') // Dynamic import
    const createClient = libsqlModule.createClient

    tursoClient = createClient({
        url: 'file:/Users/jonathannorris/git/js-sdks/tmp/turso.db',
        authToken: TURSO_AUTH_TOKEN,
        syncUrl: TURSO_DATABASE_URL,
        syncInterval: 5,
    })
    console.log('Turso local sqlite client initialized')
    await tursoClient.sync()
    console.log('Turso local sqlite client synced')

    const count = 10
    // generate count number of random numbers between 0 and 100000
    const randomNumbers = Array.from({ length: count }, () =>
        Math.floor(Math.random() * 100000),
    )
    console.log(`Random numbers: ${randomNumbers}`)

    const allResults = await Promise.all(
        randomNumbers.map(async (id) => {
            // @ts-ignore
            const res = await tursoClient.execute(
                `SELECT * FROM EdgeDBTest WHERE unique_id = ${id}`,
            )
            return res.rows[0]
        }),
    )
    console.log(`Turso results: `)
    console.dir(allResults)
}

async function startDevCycle() {
    devcycleClient = await initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY, {
        logLevel: 'info',
    }).onClientInitialized()
    console.log('DevCycle local bucketing typescript client initialized')

    await startTurso()

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

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

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

function validateUserFromQueryParams(
    queryParams: express.Request['query'],
): DVCClientAPIUser {
    if (!queryParams) {
        throw new Error('Invalid query parameters')
    }

    const user = plainToInstance(DVCClientAPIUser, queryParams || {})
    if (!user.user_id) {
        throw new Error('user_id must be defined')
    }
    return user
}

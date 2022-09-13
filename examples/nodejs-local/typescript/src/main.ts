import { DVCClient, initialize } from '@devcycle/nodejs-server-sdk'
import { DVCClientAPIUser } from '@devcycle/types'
import { plainToClass } from 'class-transformer'
import { Query } from 'express-serve-static-core'
import express from 'express'
import bodyParser from 'body-parser'

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

async function validateUserFromQueryParams(queryParams: Query): Promise<DVCClientAPIUser> {
    if (!queryParams) {
        throw new Error('Invalid query parameters')
    }

    const user = plainToClass(DVCClientAPIUser, queryParams || {})
    if (!user.user_id) {
        throw new Error('user_id must be defined')
    }
    return user
}

async function startDVC() {
    dvcClient = await initialize('server-9c96e23a-afd7-451a-bfb2-0ca91b08c2d9').onClientInitialized()
    console.log('DVC onClientInitialized')

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

startDVC()

app.get('/variables', async (req: express.Request, res: express.Response) => {
    const user = await validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(dvcClient.allVariables(user)))
})

app.get('/features', async (req: express.Request, res: express.Response) => {
    const user = await validateUserFromQueryParams(req.query)

    res.set(defaultHeaders)
    res.send(JSON.stringify(dvcClient.allFeatures(user)))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

import { initialize } from '@devcycle/nodejs-server-sdk'

async function startDVC() {
    const dvcClient = await initialize('<DVC_SERVER_KEY>').onClientInitialized()
    console.log('DVC onClientInitialized')

    const user = {
        user_id: 'node_sdk_test',
        country: 'CA'
    }

    const partyTime = dvcClient.variable(user, 'party-time', false)
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

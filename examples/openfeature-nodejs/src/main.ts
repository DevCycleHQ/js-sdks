import { OpenFeature, Client } from '@openfeature/js-sdk'
import DevCycleProvider from '@devcycle/openfeature-nodejs-provider'
import { initialize } from '@devcycle/nodejs-server-sdk'

const DVC_SERVER_SDK_KEY =
    process.env['DVC_SERVER_SDK_KEY'] || '<YOUR_DVC_SERVER_SDK_KEY>'

let openFeatureClient: Client

async function startDVC() {
    const dvcClient = await initialize(DVC_SERVER_SDK_KEY, {
        logLevel: 'info',
    }).onClientInitialized()
    OpenFeature.setProvider(new DevCycleProvider(dvcClient))
    openFeatureClient = OpenFeature.getClient()
    console.log('DevCycle OpenFeature client initialized')

    const context = {
        // Either 'targetingKey' or 'user_id` can be set here to identify the user
        targetingKey: 'node_sdk_test',
        // Other supported DVCUser properties like country can be set here and will be used for targeting with a DVCUser
        country: 'CA',
        // Any unknown properties will be added to the DVCUser as customData
        myCustomDataProperty: 'myCustomDataValue',
    }
    openFeatureClient.setContext(context)

    const partyTimeFlag = await openFeatureClient.getBooleanValue(
        'boolean-flag',
        false,
    )
    if (partyTimeFlag) {
        const invitationFlag = await openFeatureClient.getStringDetails(
            'invitation-message',
            'My birthday has been cancelled this year',
        )

        console.log(
            "Hi there, we've been friends for a long time so I thought I would tell you personally:",
        )
        console.log(invitationFlag.value)

        const jsonFlag = await openFeatureClient.getObjectValue('json-flag', {
            type: 'customType',
        })
        console.log(`JSON flag example: ${JSON.stringify(jsonFlag)}`)
    }

    const defaultVariable = await openFeatureClient.getBooleanValue(
        'not-real',
        true,
    )
    console.log(`Value of the variable is ${defaultVariable} \n`)
}

startDVC()

import { OpenFeature, Client } from '@openfeature/server-sdk'
import { DevCycleProvider } from '@devcycle/nodejs-server-sdk'

const DEVCYCLE_SERVER_SDK_KEY =
    process.env['DEVCYCLE_SERVER_SDK_KEY'] || '<DEVCYCLE_SERVER_SDK_KEY>'

let openFeatureClient: Client

async function startDevCycle() {
    const provider = new DevCycleProvider(DEVCYCLE_SERVER_SDK_KEY, {
        logLevel: 'debug',
    })
    await OpenFeature.setProviderAndWait(provider)
    openFeatureClient = OpenFeature.getClient()

    console.log('DevCycle OpenFeature client initialized')

    const context = {
        // Either 'targetingKey' or 'user_id` can be set here to identify the user
        targetingKey: 'node_sdk_test',
        // Other supported DevCycleUser properties like country can be set here
        // and will be used for targeting with a DevCycleUser
        country: 'CA',
        // Any unknown properties will be added to the DevCycleUser as customData
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

    openFeatureClient.track('of-test-event', context, {
        value: 610,
        metaDataField: 1,
        metaDataFieldString: 'test',
        metaDataFieldBoolean: true,
        metaDataFieldDouble: 1.23,
    })

    const dvcUser = {
        ...context,
        user_id: context.targetingKey,
    }
    const allFeatures = provider.devcycleClient.allFeatures(dvcUser)
    console.log(`All Features: ${JSON.stringify(allFeatures)}`)
}

startDevCycle()

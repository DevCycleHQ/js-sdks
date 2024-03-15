import { initializeDevCycle } from '@devcycle/js-cloud-server-sdk'

export interface Env {
    DEVCYCLE_SERVER_SDK_KEY: string
}

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext,
    ): Promise<Response> {
        const devcycleClient = initializeDevCycle(env.DEVCYCLE_SERVER_SDK_KEY)

        const enabledFeature = await devcycleClient.variableValue(
            {
                user_id: 'test-user',
            },
            'enabled-feature',
            false,
        )
        const disabledFeature = await devcycleClient.variableValue(
            {
                user_id: 'test-user',
            },
            'disabled-feature',
            true,
        )
        const testFeature = await devcycleClient.variableValue(
            {
                user_id: 'test-user',
            },
            'test-feature',
            false,
        )

        const variablesResponse = {
            enabledFeature: enabledFeature,
            disabledFeature: disabledFeature,
            testFeature: testFeature,
        }

        return new Response(JSON.stringify({ variables: variablesResponse }))
    },
}

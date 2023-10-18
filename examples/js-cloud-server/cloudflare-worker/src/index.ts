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

        const variables = await devcycleClient.allVariables({
            user_id: 'test-user',
        })

        return new Response(
            'DevCycle Variables: ' + JSON.stringify(variables, null, 2),
        )
    },
}

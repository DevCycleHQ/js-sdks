import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
import { headers } from 'next/headers'
export const { getVariableValue, getClientContext } = setupDevCycle({
    clientSDKKey: process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY_OPT_IN ?? '',
    serverSDKKey: process.env.E2E_NEXTJS_SERVER_KEY_OPT_IN ?? '',
    userGetter: async () => {
        const reqHeaders = await headers()
        return {
            user_id: 'opt-in-user',
            customData: {
                // set a dummy field here so that the headers call stays in the build output
                someKey: reqHeaders.get('some-key'),
            },
        }
    },
})

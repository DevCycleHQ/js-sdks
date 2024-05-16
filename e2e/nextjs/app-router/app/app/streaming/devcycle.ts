import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
const { getVariableValue, getClientContext, getAllVariables, getAllFeatures } =
    setupDevCycle({
        clientSDKKey: process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY ?? '',
        serverSDKKey: process.env.E2E_NEXTJS_SERVER_KEY ?? '',
        userGetter: async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return {
                user_id: '123',
            }
        },
        options: { enableStreaming: true },
    })

export { getVariableValue, getClientContext, getAllVariables, getAllFeatures }

import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
import { headers } from 'next/headers'
export const {
    getVariableValue,
    getClientContext,
    getAllVariables,
    getAllFeatures,
} = setupDevCycle(
    process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY ?? '',
    async () => {
        const reqHeaders = headers()
        return {
            user_id: '123',
            customData: {
                // set a dummy field here so that the headers call stays in the build output
                someKey: reqHeaders.get('some-key'),
            },
        }
    },
    { enableStreaming: false },
)

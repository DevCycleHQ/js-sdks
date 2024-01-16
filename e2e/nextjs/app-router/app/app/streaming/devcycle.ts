import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
import { headers } from 'next/headers'
const { getVariableValue, getClientContext, getAllVariables, getAllFeatures } =
    setupDevCycle(
        process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY ?? '',
        async () => {
            // console.log(headers())
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return {
                user_id: '123',
            }
        },
        { enableStreaming: true },
    )

export { getVariableValue, getClientContext, getAllVariables, getAllFeatures }

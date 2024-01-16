import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
const { getVariableValue, getClientContext, getAllVariables, getAllFeatures } =
    setupDevCycle(
        process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY ?? '',
        async () => {
            return {
                user_id: '123',
            }
        },
        { enableStreaming: true },
    )

export { getVariableValue, getClientContext, getAllVariables, getAllFeatures }

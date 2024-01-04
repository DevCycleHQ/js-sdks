import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
const { getVariableValue, getClientContext } = setupDevCycle(
    process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY ?? '',
    async () => {
        // await new Promise((resolve) => setTimeout(resolve, 5000))
        return {
            user_id: '123',
        }
    },
    { enableStreaming: true },
)

export { getVariableValue, getClientContext }

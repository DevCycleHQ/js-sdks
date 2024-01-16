import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
const { getVariableValue, getClientContext } = setupDevCycle(
    process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY ?? '',
    async () => {
        return {
            user_id: '123',
        }
    },
    { enableStreaming: false },
)

export { getVariableValue, getClientContext }

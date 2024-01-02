import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
const { getVariableValue, getClientContext } = setupDevCycle(
    process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY ?? '',
    async () => ({
        user_id: '123',
    }),
    {},
)

export { getVariableValue, getClientContext }

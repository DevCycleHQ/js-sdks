import { setupDevCycle } from '@devcycle/nextjs-sdk/server'

const getUserIdentity = async () => {
    // pseudocode function representing some call you might make to
    // your code to determine the current user
    // You can use Next APIs such as `headers()` and `cookies()` here
    return {
        user_id: process.env.NEXT_PUBLIC_USER_ID || 'server-user',
    }
}

const { getVariableValue, getClientContext } = setupDevCycle(
    // SDK Key. This will be public and sent to the client, so you MUST use the client SDK key.
    process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY ?? '',
    // pass your method for getting the user identity
    getUserIdentity,
    // pass any options you want to use for the DevCycle SDK
    {
        enableStreaming: process.env.NEXT_PUBLIC_ENABLE_STREAMING === '1',
    },
)

export { getVariableValue, getClientContext, getUserIdentity }

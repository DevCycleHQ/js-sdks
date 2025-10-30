import { setupDevCycle } from '@devcycle/nextjs-sdk/server'
import { headers } from 'next/headers'
export const {
    getVariableValue,
    getClientContext,
    getAllVariables,
    getAllFeatures,
} = setupDevCycle({
    clientSDKKey: process.env.NEXT_PUBLIC_E2E_EDGEDB_CLIENT_KEY ?? '',
    serverSDKKey: process.env.E2E_EDGEDB_SERVER_KEY ?? '',
    userGetter: async () => {
        const reqHeaders = await headers()
        // Keep headers() call to prevent it from being removed during build
        const _keepInBuild = reqHeaders.get('some-key')
        return {
            user_id: 'edgedb-user-1',
        }
    },
    options: {
        enableStreaming: false,
        enableEdgeDB: true,
    },
})

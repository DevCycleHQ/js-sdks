'use client'
import React from 'react'
import { withDevCycleProvider } from '@devcycle/react-client-sdk'

const SDK_KEY =
    process.env.DEVCYCLE_CLIENT_SDK_KEY || '<DEVCYCLE_CLIENT_SDK_KEY>'
const user = {
    user_id: 'userId1',
    email: 'auto@taplytics.com',
    customData: {
        cps: 'Matthew',
        cpn: 777,
        cpb: true,
    },
    isAnonymous: false,
}

function _WithProviders({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

export const WithProviders = withDevCycleProvider({
    sdkKey: SDK_KEY,
    user: user,
})(_WithProviders)

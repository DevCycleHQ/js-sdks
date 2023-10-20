'use client'
import React from 'react'
import { withDevCycleProvider } from '@devcycle/react-client-sdk'

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
    sdkKey: 'asdas',
    user: user,
})(_WithProviders)

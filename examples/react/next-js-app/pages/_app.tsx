import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import { withDVCProvider } from '@devcycle/devcycle-react-sdk'

const SDK_KEY = process.env.NX_CLIENT_KEY || 'test_token'
const user = {
    user_id: 'userId1',
    email: 'auto@taplytics.com',
    customData: {
        cps: 'Matthew',
        cpn: 777,
        cpb: true
    },
    isAnonymous: false
}

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}

export default withDVCProvider({ sdkKey: SDK_KEY, user: user })(MyApp as React.FC)

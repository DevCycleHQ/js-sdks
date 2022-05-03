import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import { withDVCProvider } from '@devcycle/devcycle-react-sdk'
import dynamic from 'next/dynamic'

const ENV_KEY = process.env.NX_CLIENT_KEY || 'test_token'
const user = {
    user_id: 'userId1',
    email: 'auto@taplytics.com',
    isAnonymous: false
}

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}

export default dynamic(() => Promise.resolve(withDVCProvider({ envKey: ENV_KEY, user: user })(MyApp as React.FC)), {
    ssr: false,
})

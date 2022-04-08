import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import { withDVCProvider } from '@devcycle/devcycle-react-sdk'

const ENV_KEY = process.env['NX_CLIENT_KEY'] || 'test_token'
const user = {
    user_id: 'userId1',
    isAnonymous: false
}

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
export default withDVCProvider({ envKey: ENV_KEY, user: user })(MyApp as React.FC)

import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import { appWithDevCycle } from '@devcycle/next-sdk/pages'

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}

export default appWithDevCycle(MyApp)

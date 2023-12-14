import type { AppProps } from 'next/app'
import { appWithDevCycle } from '@devcycle/nextjs-sdk/pages'

export default appWithDevCycle(function App({
    Component,
    pageProps,
}: AppProps) {
    return <Component {...pageProps} />
})

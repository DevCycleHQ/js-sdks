import {
    getServerSideDevCycle,
    useVariableValue,
} from '@devcycle/nextjs-sdk/pages'
import { GetServerSidePropsContext } from 'next'
import { useEffect, useRef } from 'react'

interface OptInPageProps {
    userId: string
}

export default function OptInPage({ userId }: OptInPageProps) {
    const optInEnabledFeature = useVariableValue('opt-in-feature', 'default')
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (
                event.data?.type === 'DVC.optIn.updateHeight' &&
                iframeRef.current
            ) {
                iframeRef.current.style.height = event.data.height
            }
        }

        window.addEventListener('message', handleMessage)
        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [])

    return (
        <>
            <main>
                <div>OptIn Test Page</div>
                <div>
                    OptIn Enabled Feature: {JSON.stringify(optInEnabledFeature)}
                </div>
                <iframe
                    ref={iframeRef}
                    data-dvc-widget="dvc-iframe"
                    src={`https://opt-in.devcycle.com/?userId=${userId}&sdkKey=${
                        process.env.NEXT_PUBLIC_E2E_OPTIN_CLIENT_KEY || ''
                    }`}
                    title="Feature Opt-In"
                    width="800"
                    style={{ border: 'none' }}
                    scrolling="no"
                />
            </main>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const userId =
        (context.req.headers['x-test-user-id'] as string) ||
        'optin-user-pages-1'
    return {
        props: {
            userId,
            ...(await getServerSideDevCycle({
                serverSDKKey: process.env.E2E_OPTIN_SERVER_KEY || '',
                clientSDKKey:
                    process.env.NEXT_PUBLIC_E2E_OPTIN_CLIENT_KEY || '',
                user: { user_id: userId },
                context,
            })),
        },
    }
}

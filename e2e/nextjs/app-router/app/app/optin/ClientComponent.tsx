'use client'
import React, { useEffect, useState } from 'react'
import {
    useVariableValue,
    useAllVariables,
    useAllFeatures,
    useUserIdentity,
} from '@devcycle/nextjs-sdk'

export const ClientComponent = () => {
    const enabledVar = useVariableValue('enabled-feature', false)
    const disabledVar = useVariableValue('disabled-feature', false)
    const allVariables = useAllVariables()
    const allFeatures = useAllFeatures()

    const optInEnabledFeature = useVariableValue('opt-in-feature', 'default')
    const user = useUserIdentity()

    const [iframeHeight, setIframeHeight] = useState<string>('900')

    const adjustIframeHeight = (event: MessageEvent<unknown>) => {
        const { data } = event as { data: { type: string; height: string } }
        if (data.type === 'DVC.optIn.updateHeight') {
            setIframeHeight(data.height)
        }
    }

    useEffect(() => {
        window.addEventListener('message', adjustIframeHeight)

        return () => {
            window.removeEventListener('message', adjustIframeHeight)
        }
    }, [])

    return (
        <div>
            <h1>Client Component (OptIn Enabled)</h1>
            <p>Client Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Client All Variables: {JSON.stringify(allVariables)}</p>
            <p>Client All Features: {JSON.stringify(allFeatures)}</p>
            <h2>OptIn-Targeted Features:</h2>
            <p>Client OptIn Enabled Feature: {optInEnabledFeature}</p>
            <iframe
                data-dvc-widget="dvc-iframe"
                scrolling="no"
                src={`https://opt-in.devcycle.com/?userId=${user?.user_id}&sdkKey=${process.env.NEXT_PUBLIC_E2E_OPTIN_CLIENT_KEY}`}
                title="Feature Opt-In"
                width="800"
                height={iframeHeight}
                frameBorder="0"
            />
        </div>
    )
}

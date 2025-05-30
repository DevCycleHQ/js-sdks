'use client'
import {
    useVariableValue,
    useAllVariables,
    useAllFeatures,
} from '@devcycle/nextjs-sdk'
import { useEffect } from 'react'

export const ClientComponent = () => {
    useEffect(() => {
        const iframe = document.querySelector(
            "iframe[data-dvc-widget='dvc-iframe']",
        ) as HTMLIFrameElement
        window.addEventListener(
            'message',
            function (e) {
                const t = e.data
                'DVC.optIn.updateHeight' === t.type &&
                    (iframe.style.height = t.height)
            },
            !1,
        )
    }, [])

    const optInValue = useVariableValue('opt-in-feature', 'off')
    const allVariables = useAllVariables()
    const allFeatures = useAllFeatures()
    const userId = 'opt-in-user'
    const clientSdkKey = process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY_OPT_IN
    const iframeSrc = `https://opt-in.devcycle.com/?userId=${userId}&sdkKey=${clientSdkKey}`
    return (
        <div>
            <h1>Client Component</h1>
            <p>Client Enabled Variable: {optInValue}</p>
            <p>Client All Variables: {JSON.stringify(allVariables)}</p>
            <p>Client All Features: {JSON.stringify(allFeatures)}</p>
            <iframe
                data-dvc-widget="dvc-iframe"
                src={iframeSrc}
                title="Feature Opt-In"
                width="800"
                style={{ border: 'none' }}
            ></iframe>
        </div>
    )
}

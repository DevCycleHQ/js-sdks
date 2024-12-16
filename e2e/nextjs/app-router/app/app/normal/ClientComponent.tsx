'use client'
import {
    useVariableValue,
    useAllVariables,
    useAllFeatures,
    renderIfEnabled,
} from '@devcycle/nextjs-sdk'
import { useState } from 'react'
import { testAction } from './action'

const ConditionalComponent = renderIfEnabled(
    'enabled-feature',
    () => import('./ConditionalClientComponent'),
)

export const ClientComponent = () => {
    const enabledVar = useVariableValue('enabled-feature', false)
    const disabledVar = useVariableValue('disabled-feature', false)
    const allVariables = useAllVariables()
    const allFeatures = useAllFeatures()
    const [actionResult, setActionResult] = useState<boolean | null>(null)

    return (
        <div>
            <h1>Client Component</h1>
            <p>Client Enabled Variable: {JSON.stringify(enabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(disabledVar)}</p>
            <p>Client All Variables: {JSON.stringify(allVariables)}</p>
            <p>Client All Features: {JSON.stringify(allFeatures)}</p>
            <p>Client Action Result: {JSON.stringify(actionResult)}</p>
            <button
                onClick={() =>
                    testAction().then((result) => setActionResult(result))
                }
            >
                Test Action
            </button>
            <ConditionalComponent />
        </div>
    )
}

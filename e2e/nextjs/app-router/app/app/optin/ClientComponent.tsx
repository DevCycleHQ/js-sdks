'use client'
import {
    useVariableValue,
    useAllVariables,
    useAllFeatures,
} from '@devcycle/nextjs-sdk'

export const ClientComponent = () => {
    const optInValue = useVariableValue('opt-in-feature', 'off')
    const allVariables = useAllVariables()
    const allFeatures = useAllFeatures()

    return (
        <div>
            <h1>Client Component</h1>
            <p>Client Enabled Variable: {optInValue}</p>
            <p>Client All Variables: {JSON.stringify(allVariables)}</p>
            <p>Client All Features: {JSON.stringify(allFeatures)}</p>
        </div>
    )
}

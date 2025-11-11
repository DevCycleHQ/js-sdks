import {
    getServerSideDevCycleWithHelpers,
    useVariableValue,
} from '@devcycle/nextjs-sdk/pages'
import { GetServerSidePropsContext } from 'next'

export default function ServerEvalPage({
    serverEnabledVar,
    serverDisabledVar,
    serverAllVariables,
    serverAllFeatures,
}: {
    serverEnabledVar: boolean
    serverDisabledVar: boolean
    serverAllVariables: string
    serverAllFeatures: string
}) {
    // Client-side evaluation (for comparison)
    const clientEnabledVar = useVariableValue('enabled-feature', false)
    const clientDisabledVar = useVariableValue('disabled-feature', false)

    return (
        <main>
            <h1>Server Evaluation Test</h1>
            <p>Server Enabled Variable: {JSON.stringify(serverEnabledVar)}</p>
            <p>Server Disabled Variable: {JSON.stringify(serverDisabledVar)}</p>
            <p>Server All Variables: {serverAllVariables}</p>
            <p>Server All Features: {serverAllFeatures}</p>
            <p>Client Enabled Variable: {JSON.stringify(clientEnabledVar)}</p>
            <p>Client Disabled Variable: {JSON.stringify(clientDisabledVar)}</p>
        </main>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const {
        getVariableValue,
        getAllVariables,
        getAllFeatures,
        track,
        getSSRProps,
    } = await getServerSideDevCycleWithHelpers({
        serverSDKKey: process.env.E2E_NEXTJS_SERVER_KEY || '',
        clientSDKKey: process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY || '',
        user: { user_id: 'normal-user' },
        context,
    })

    // Server-side evaluation (
    const serverEnabledVar = await getVariableValue('enabled-feature', false)
    const serverDisabledVar = await getVariableValue('disabled-feature', false)
    const allVariables = await getAllVariables()
    const allFeatures = await getAllFeatures()

    // Track custom event (test event tracking)
    track({
        type: 'test-page-view',
        target: 'server-eval-page',
    })

    return {
        props: {
            serverEnabledVar,
            serverDisabledVar,
            serverAllVariables: JSON.stringify(allVariables),
            serverAllFeatures: JSON.stringify(allFeatures),
            ...(await getSSRProps()),
        },
    }
}

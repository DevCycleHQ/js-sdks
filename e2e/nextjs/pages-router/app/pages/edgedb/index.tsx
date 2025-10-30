import {
    getServerSideDevCycle,
    useVariableValue,
} from '@devcycle/nextjs-sdk/pages'
import { GetServerSidePropsContext } from 'next'

export default function EdgeDBPage() {
    const enabledVariable = useVariableValue('enabled-feature', false)
    const disabledVariable = useVariableValue('disabled-feature', false)

    // EdgeDB-targeted features
    const premiumFeature = useVariableValue('edgedb-premium-feature', false)
    const registeredAccess = useVariableValue('registered-access', false)

    return (
        <>
            <main>
                <div>EdgeDB Test Page</div>
                <div>
                    Pages Enabled Variable: {JSON.stringify(enabledVariable)}
                </div>
                <div>
                    Pages Disabled Variable: {JSON.stringify(disabledVariable)}
                </div>
                <h2>EdgeDB-Targeted Features:</h2>
                <div>
                    Pages Premium Feature: {JSON.stringify(premiumFeature)}
                </div>
                <div>
                    Pages Registered Access: {JSON.stringify(registeredAccess)}
                </div>
            </main>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    return {
        props: {
            ...(await getServerSideDevCycle({
                serverSDKKey: process.env.E2E_EDGEDB_SERVER_KEY || '',
                clientSDKKey:
                    process.env.NEXT_PUBLIC_E2E_EDGEDB_CLIENT_KEY || '',
                user: { user_id: 'edgedb-user-1' },
                context,
                options: { enableEdgeDB: true },
            })),
        },
    }
}

import {
    getServerSideDevCycle,
    useVariableValue,
} from '@devcycle/nextjs-sdk/pages'
import { GetServerSidePropsContext } from 'next'

export default function Home() {
    const enabledVariable = useVariableValue('enabled-feature', false)
    const disabledVariable = useVariableValue('disabled-feature', false)
    return (
        <>
            <main>
                <div>
                    Pages Enabled Variable: {JSON.stringify(enabledVariable)}
                </div>
                <div>
                    Pages Disabled Variable: {JSON.stringify(disabledVariable)}
                </div>
            </main>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    return {
        props: {
            ...(await getServerSideDevCycle(
                process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY || '',
                { user_id: 'test' },
                context,
            )),
        },
    }
}

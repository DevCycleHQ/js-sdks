import {
    getServerSideDevCycle,
    useVariableValue,
} from '@devcycle/nextjs-sdk/pages'
import { GetServerSidePropsContext } from 'next'

export default function Home() {
    const variable = useVariableValue('variable', false)
    return (
        <>
            <main>
                <div>Pages Variable: {JSON.stringify(variable)}</div>
            </main>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    return {
        props: {
            ...(await getServerSideDevCycle(
                process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY || '',
                { user_id: 'test' },
                context,
            )),
        },
    }
}

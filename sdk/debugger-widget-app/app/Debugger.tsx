import { DebuggerData } from './types'
import { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useSearchParams } from 'next/navigation'
import { Header } from './Header'
import { DevCycleUser } from '@devcycle/js-client-sdk'
import { LiveEventRow } from './Events'
import { LoginScreen } from './Login'
import { updateUserIdentity } from './messages'

const UserDisplay = ({ user }: { user: DevCycleUser }) => {
    return (
        <div>
            <h2 className={'font-bold'}>Current User Data</h2>
            <div className={'grid grid-cols-2'}>
                <h2>User Id:</h2>
                <div>{user.user_id}</div>
                <h2>Is Anonymous:</h2>
                <div>{`${user.isAnonymous}`}</div>
                <h2>Email:</h2>
                <div>{user.email ?? 'Not Set'}</div>
                <h2>Name:</h2>
                <div>{user.name ?? 'Not Set'}</div>
                <h2>Custom Data:</h2>
                {user.customData ? <div></div> : <div>Not Set</div>}
                {user.customData ? (
                    <div className={'grid grid-cols-2 col-span-2'}>
                        {Object.keys(user.customData).map((key) => {
                            return (
                                <>
                                    <h3>{key}</h3>
                                    <pre>
                                        {JSON.stringify(user.customData![key])}
                                    </pre>
                                </>
                            )
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

const FeatureVarsDisplay = ({ config }: { config: DebuggerData['config'] }) => {
    const variableKeys = Object.keys(config.variables)
    const alphabeticalSort = (a: string, b: string) => a.localeCompare(b)
    const sortedKeys = variableKeys.sort(alphabeticalSort)
    return (
        <div className={'flex-col flex gap-3 mt-3'}>
            <h2 className={'font-bold'}>Variable Values</h2>
            {sortedKeys.map((variableKey) => {
                const variable = config.variables[variableKey]
                return (
                    <div
                        key={variableKey}
                        className={'flex flex-col border-b-2 pb-2'}
                    >
                        <h2 className={'font-bold'}>{variableKey}</h2>
                        <div className={'grid grid-cols-2'}>
                            <h2>Value:</h2>
                            <pre>{JSON.stringify(variable.value)}</pre>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const ConfigurationContent = ({ data }: { data: DebuggerData }) => {
    const searchParams = useSearchParams()

    return (
        <div className={'flex flex-col gap-4 pt-4'}>
            <button
                onClick={() =>
                    updateUserIdentity(
                        { user_id: 'testUpdate' },
                        searchParams.get('parentOrigin')!,
                    )
                }
            >
                Update Identity
            </button>
            <UserDisplay user={data.user} />
            <FeatureVarsDisplay config={data.config} />
        </div>
    )
}

const Tab = ({
    name,
    selected,
    onClick,
}: {
    name: string
    selected: boolean
    onClick: () => void
}) => {
    return (
        <div
            className={
                'grow p-4 text-center cursor-pointer ' +
                (selected ? 'bg-slate-200' : 'bg-slate-100')
            }
            onClick={onClick}
        >
            {name}
        </div>
    )
}
const DebuggerContent = ({
    data,
    selfTargeting,
}: {
    data: DebuggerData | null
    selfTargeting: React.ReactNode
}) => {
    const { user, isLoading } = useUser()
    const searchParams = useSearchParams()
    const org_id = searchParams.get('org_id')
    const [selectedTab, setSelectedTab] = useState<
        'config' | 'events' | 'selftargeting'
    >('config')

    if (isLoading) return <div>Loading...</div>
    if (!user || (org_id && user.org_id != org_id)) return <LoginScreen />
    if (!data) {
        return <h1>No data received!</h1>
    }

    return (
        <>
            <Header />
            <div className={'flex flex-row justify-around sticky top-[70px]'}>
                <Tab
                    name={'Configuration'}
                    selected={selectedTab === 'config'}
                    onClick={() => setSelectedTab('config')}
                />
                <Tab
                    name={'Events'}
                    selected={selectedTab === 'events'}
                    onClick={() => setSelectedTab('events')}
                />
                <Tab
                    name={'Self-Targeting'}
                    selected={selectedTab === 'selftargeting'}
                    onClick={() => setSelectedTab('selftargeting')}
                />
            </div>
            <div className={'px-3'}>
                {selectedTab === 'config' && (
                    <ConfigurationContent data={data} />
                )}{' '}
                {selectedTab === 'events' && (
                    <div className={'flex flex-col gap-4 mt-6'}>
                        {data?.liveEvents.map((event, i) => (
                            <LiveEventRow key={i} event={event} />
                        ))}
                    </div>
                )}
                {selectedTab === 'selftargeting' && selfTargeting}
            </div>
        </>
    )
}

export const Debugger = ({
    data,
    selfTargeting,
}: {
    data: DebuggerData | null
    selfTargeting: React.ReactNode
}) => {
    return (
        <div
            className={
                'bg-white rounded-3xl overflow-y-scroll overflow-x-hidden no-scrollbar h-[600px] relative'
            }
        >
            <DebuggerContent data={data} selfTargeting={selfTargeting} />
        </div>
    )
}

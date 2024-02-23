import { DebuggerData, LiveEvent } from './types'
import { useState } from 'react'

const humanReadableTypes = {
    ['variableEvaluated']: 'Variable Evaluated',
    ['variableUpdated']: 'Variable Updated',
    ['configUpdated']: 'Config Updated',
}

const EventRowContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className={
                'flex border-t-2 border-b-2 border-slate-600 flex-col bg-slate-100 p-2'
            }
        >
            {children}
        </div>
    )
}

const VariableEvaluatedRow = ({ event }: { event: LiveEvent }) => {
    return (
        <EventRowContainer>
            <h3 className={'font-bold'}>{humanReadableTypes[event.type]}</h3>
            <div className={'grid grid-cols-2'}>
                {' '}
                <h2>Defaulted? </h2>
                <div>{event.variable?.isDefaulted ? 'yes' : 'no'}</div>
                <h2>Value:</h2>
                <pre>{JSON.stringify(event.variable?.value)}</pre>
            </div>
        </EventRowContainer>
    )
}

const LiveEventRow = ({ event }: { event: LiveEvent }) => {
    if (event.type === 'variableEvaluated') {
        return <VariableEvaluatedRow event={event} />
    }
    return (
        <EventRowContainer>
            <h3>{humanReadableTypes[event.type]}</h3>
            <pre>{JSON.stringify(event, null, 2)}</pre>
        </EventRowContainer>
    )
}

const FeatureVarsDisplay = ({ config }: { config: DebuggerData['config'] }) => {
    const variableKeys = Object.keys(config.variables)
    const alphabeticalSort = (a: string, b: string) => a.localeCompare(b)
    const sortedKeys = variableKeys.sort(alphabeticalSort)
    return (
        <div className={'flex-col flex gap-3 mt-3'}>
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

export const Debugger = ({ data }: { data: DebuggerData | null }) => {
    const [selectedTab, setSelectedTab] = useState<'config' | 'events'>(
        'config',
    )
    if (!data) {
        return <h1>No data received!</h1>
    }
    return (
        <div
            className={
                'bg-white rounded-3xl p-3 overflow-y-scroll overflow-x-hidden no-scrollbar h-[600px]'
            }
        >
            <h1 className={'font-bold text-lg mb-3'}>DevCycle Debugger</h1>
            <div className={'flex flex-row justify-around'}>
                <div
                    className={
                        'grow p-4 text-center cursor-pointer ' +
                        (selectedTab === 'config'
                            ? 'bg-slate-200'
                            : 'bg-slate-100')
                    }
                    onClick={() => setSelectedTab('config')}
                >
                    Configuration
                </div>
                <div
                    className={
                        'grow p-4 text-center cursor-pointer ' +
                        (selectedTab === 'events'
                            ? 'bg-slate-200'
                            : 'bg-slate-100')
                    }
                    onClick={() => setSelectedTab('events')}
                >
                    Events
                </div>
            </div>

            {selectedTab === 'config' ? (
                <FeatureVarsDisplay config={data.config} />
            ) : (
                <div className={'flex flex-col gap-4 mt-6'}>
                    {data?.liveEvents.map((event, i) => (
                        <LiveEventRow key={i} event={event} />
                    ))}
                </div>
            )}
        </div>
    )
}

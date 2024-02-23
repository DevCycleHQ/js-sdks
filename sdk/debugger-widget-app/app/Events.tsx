import { LiveEvent } from './types'

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

export const LiveEventRow = ({ event }: { event: LiveEvent }) => {
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

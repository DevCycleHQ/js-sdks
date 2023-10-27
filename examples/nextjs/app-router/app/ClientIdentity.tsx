'use client'
import {
    useDevCycleClient,
    useIdentifyUser,
    useVariableValue,
} from '@devcycle/next-sdk'
import { b } from 'msw/lib/glossary-dc3fd077'

const clientsideIds = [
    'clientside-1',
    'clientside-2',
    'clientside-3',
    'clientside-4',
    'clientside-5',
    'clientside-6',
    'clientside-7',
    'clientside-8',
    'clientside-9',
    'clientside-10',
]

export const ClientIdentity = () => {
    const client = useDevCycleClient()
    const variable = useVariableValue('test-featre', false)
    const identifyUser = useIdentifyUser()
    const clientsideUser = {
        user_id:
            clientsideIds[Math.floor(Math.random() * clientsideIds.length)],
    }
    const identifyNewUser = () => {
        identifyUser(clientsideUser)
    }
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#DDF',
            }}
        >
            <b>Client Variable</b>
            <span>{JSON.stringify(variable)}</span>
            <b>Client User Identity</b>
            <span>{client.user?.user_id}</span>
            <br />
            <button onClick={identifyNewUser}>Identify User Clientside</button>
        </div>
    )
}

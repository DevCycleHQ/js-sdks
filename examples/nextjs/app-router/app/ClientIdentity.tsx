'use client'
import {
    useIdentifyUser,
    useUserIdentity,
    useVariableValue,
} from '@devcycle/next-sdk'

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
    const variable = useVariableValue('test-featre', false)
    const userIdentity = useUserIdentity()
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
            <span>{userIdentity?.user_id}</span>
            <br />
            <button onClick={identifyNewUser}>Identify User Clientside</button>
        </div>
    )
}

import {
    useDevCycleClient,
    useIdentifyUser,
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

export const UserIdentity = () => {
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
        <>
            <b>Client Variable</b>
            <span>{JSON.stringify(variable)}</span>
            <b>Client User Identity</b>
            <span>{client.user?.user_id}</span>
            <button onClick={identifyNewUser}>Identify User Clientside</button>
        </>
    )
}

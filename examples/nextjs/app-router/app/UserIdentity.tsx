import {
    useDevCycleClient,
    useIdentifyUser,
    useVariableValue,
} from '@devcycle/next-sdk'

const clientsideUser = {
    user_id: 'clientside',
}

export const UserIdentity = () => {
    const client = useDevCycleClient()
    const variable = useVariableValue('test-featre', false)
    const identifyUser = useIdentifyUser()
    const identifyNewUser = () => {
        identifyUser(clientsideUser)
    }
    return (
        <>
            <h2>Client Variable</h2>
            <h3>{JSON.stringify(variable)}</h3>
            <h2>Client User Identity</h2>
            <h3>{JSON.stringify(client.user?.user_id)}</h3>
            <button onClick={identifyNewUser}>Identify User Clientside</button>
        </>
    )
}

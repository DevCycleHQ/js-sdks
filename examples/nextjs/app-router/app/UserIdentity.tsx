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
            <b>Client Variable</b>
            <span>{JSON.stringify(variable)}</span>
            <b>Client User Identity</b>
            <span>{JSON.stringify(client.user?.user_id)}</span>
            <button onClick={identifyNewUser}>Identify User Clientside</button>
        </>
    )
}

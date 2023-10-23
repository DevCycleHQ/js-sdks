import { useDevCycleClient, useIdentifyUser } from '@devcycle/next-sdk'

const clientsideUser = {
    user_id: 'clientside',
}

export const UserIdentity = () => {
    const client = useDevCycleClient()
    const identifyUser = useIdentifyUser()
    const identifyNewUser = () => {
        identifyUser(clientsideUser)
    }
    return (
        <>
            <h1>Current User Identity</h1>
            <h2>{JSON.stringify(client.user?.user_id)}</h2>
            <button onClick={identifyNewUser}>Identify User Clientside</button>
        </>
    )
}

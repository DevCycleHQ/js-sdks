import { useClient } from '@devcycle/next-sdk'
import { identifyUser } from '@devcycle/next-sdk'

const clientsideUser = {
    user_id: 'clientside',
}

export const UserIdentity = () => {
    const client = useClient()
    const identifyNewUser = () => {
        identifyUser(clientsideUser)
    }
    return (
        <>
            <h1>Current User Identity</h1>
            <h2>{JSON.stringify(client.user)}</h2>
            <button onClick={identifyNewUser}>Identify User Clientside</button>
        </>
    )
}

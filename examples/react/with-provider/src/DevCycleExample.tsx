import { useVariable, useDVCClient } from '@devcycle/devcycle-react-sdk'
import Button from 'react-bootstrap/Button'
import React from 'react'

export default function DevCycleExample(): React.ReactElement {
    const variableKey = 'my-feature'
    const variable = useVariable(variableKey, true)
    const client = useDVCClient()

    const identify = () => {
        client?.identifyUser({
            user_id: 'my-new-user-id',

            isAnonymous: false
        })
    }

    const reset = () => {
        client?.resetUser()
    }

    return (
        <div>
            <span> Your variable is {variable.value ? 'ON' : 'OFF'} </span>
            <div>
                <Button variant="primary" onClick={identify}>Identify User</Button>{' '}
            </div>
            <div>
                <Button variant="primary" onClick={reset}>Reset User</Button>{' '}
            </div>
        </div>
    )
}

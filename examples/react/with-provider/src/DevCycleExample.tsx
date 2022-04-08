import { useVariable, useDVCClient } from '@devcycle/devcycle-react-sdk'
import Button from 'react-bootstrap/Button'
import React from 'react'

export default function DevCycleExample(): React.ReactElement {
    const variableKey = 'feature-release'
    const variableKeyString = 'variable-key-string'
    const variableKeyNumber = 'variable-key-number'
    const variableKeyBoolean = 'variable-key-boolean'
    const variableKeyJson = 'json-key-string'


    const variable = useVariable( variableKey, true)
    const variableString = useVariable( variableKeyString, 'pink')
    const variableNumber = useVariable( variableKeyNumber, 100)
    const variableBoolean = useVariable( variableKeyBoolean, true)
    const variableJson = useVariable( 'json-key-string', {'jsonStringKey1':'json string value 1'})


    const client = useDVCClient()

    const identify = () => {
        client?.identifyUser({
            user_id: 'userId1',

            isAnonymous: false
        })
    }

    const reset = () => {
        client?.resetUser()
    }

    return (
        <div>
            <span> Your default variable feature-release = {variable.value ? 'ON' : 'OFF'} </span>
            <div>
                Your variable variableString = {variableString.value}
            </div>
            <div>
                Your variable variableNumber = {variableNumber.value}
            </div>
            <div>
                Your variable variableBoolean = {variableBoolean.value ? 'ON' : 'OFF'}
            </div>
            <div>
                Your variable variableJson = {JSON.stringify(variableJson.value)}
            </div>

            <div>
                <Button variant="primary" onClick={identify}>Identify User</Button>{' '}
            </div>
            <div>
                <Button variant="primary" onClick={reset}>Reset User</Button>{' '}
            </div>
        </div>
    )
}

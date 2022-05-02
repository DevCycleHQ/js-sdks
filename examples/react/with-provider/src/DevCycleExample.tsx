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
    const variableBoolean = useVariable( variableKeyBoolean, false)
    const variableJson = useVariable( 'json-key-string', { 'jsonStringKey1':'json string value 1' })

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
            <div>
                <span>
            Your default feature-release variable and selected Variation  =  {variable?.value ? 'ON' : 'OFF'}
                </span>
            </div>
            <div>
                <span> Your feature-release variable value = {JSON.stringify(variable.value)} </span>
            </div>
            <div>
                <span> Your variableString variable = {JSON.stringify(variableString.value)} </span>
            </div>
            <div>
                <span> Your variableNumber variable = {variableNumber.value} </span>
            </div>
            <div>
                <span>
            Your variableBoolean variable and selected Variation = {variableBoolean.value ? 'OFF' : 'ON'}
                </span>
            </div>
            <div>
                <span> Your variableBoolean variable value = {JSON.stringify(variableBoolean.value)}
                </span>
            </div>
            <div>
                <span> Your variableJson variable = {JSON.stringify(variableJson.value)} </span>
            </div>
        </div>
    )
}

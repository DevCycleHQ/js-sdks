import { useVariable } from '@devcycle/devcycle-react-sdk'
import React from 'react'

export default function DevCycleExample(): React.ReactElement {
    const variableKey = 'feature-release'
    const variableKeyString = 'variable-key-string'
    const variableKeyNumber = 'variable-key-number'
    const variableKeyBoolean = 'variable-key-boolean'
    const variableKeyJsonString = 'variable-json-key-string'

    const variable = useVariable( variableKey, true)
    const variableString = useVariable( variableKeyString, 'green')
    const variableNumber = useVariable( variableKeyNumber, 600)
    const variableBoolean = useVariable( variableKeyBoolean, false)
    const variableJsonString = useVariable(
        variableKeyJsonString, 
        { 'jsonStringKeyDefault':'json string value default' }
    )

    return (
        <div>
            <div>
                <span>
            Your feature-release selected Variation  =  {variable?.value ? 'ON' : 'OFF'}
                </span>
            </div>
            <div>
                <span> Your variable feature-release value = {JSON.stringify(variable.value)} </span>
            </div>
            <div>
                <span> Your variable variableString value = {JSON.stringify(variableString.value)} </span>
            </div>
            <div>
                <span> Your variable variableNumber value = {JSON.stringify(variableNumber.value)} </span>
            </div>
            <div>
                <span>
            Your variable variableBoolean value and selected Variation = {variableBoolean.value ? 'OFF' : 'ON'}
                </span>
            </div>
            <div>
                <span> Your variable variableBoolean value = {JSON.stringify(variableBoolean.value)}
                </span>
            </div>
            <div>
                <span> Your variable variableJsonString value = {JSON.stringify(variableJsonString.value)} </span>
            </div>
        </div>
    )
}

import { useVariable } from '@devcycle/devcycle-react-sdk'
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
    const variableJson = useVariable( 'json-key-string', {'jsonStringKey1':'json string value 1'})

    return (
    <div>
        <div>
            <span> Your defaulte variable feature-release selected Variation =  {variable?.value ? 'ON' : 'OFF'} </span>
        </div>
        <div>
            <span> Your variable feature-release value = {JSON.stringify(variable.value)} </span>
        </div>
        <div>
            <span> Your variable variableString = {variableString.value} </span>
        </div>
        <div>
            <span> Your variable variableNumber = {variableNumber.value} </span>
        </div>
        <div>
            <span> Your variable variableBoolean selected Variation = {variableBoolean.value ? 'OFF' : 'ON'} </span>
        </div>
        <div>
            <span> Your variable variableBoolean value = {JSON.stringify(variableBoolean.value)} </span>
        </div>
        <div>   
            <span> Your variable variableJson = {JSON.stringify(variableJson.value)} </span>
        </div>
    </div>
    )
}

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
    const variableBoolean = useVariable( variableKeyBoolean, true)
    const variableJson = useVariable( 'json-key-string', {'jsonStringKey1':'json string value 1'})


    return (
    <div>
        <div>
            <span> Your defaulte variable feature-release =  {variable?.value ? 'ON' : 'OFF'} </span>
        </div>
    
        <div>
            <span> Your variable variableString = {variableString.value} </span>
        </div>
        <div>
            <span> Your variable variableNumber = {variableNumber.value} </span>
        </div>
        <div>
            <span> Your variable variableBoolean = {variableBoolean.value ? 'ON' : 'OFF'} </span>
        </div>
        <div>   
            <span> Your variable variableJson = {JSON.stringify(variableJson.value)} </span>
        </div>

        </div>
    )
}

import { useVariable } from '@devcycle/devcycle-react-sdk'
import { VariableValue } from '@devcycle/types'
import React from 'react'

export default function DevCycleExample(): React.ReactElement {
    const useVariableWithTracking = (key: string, defaultValue: VariableValue) => {
        const variable = useVariable(key, defaultValue)

        if (variable.isDefaulted) {
            console.log(`variable ${variable.key} defaulted`)
            // defaulted variable, track event
        } else {
            console.log(`variable ${variable.key} evaluated`)
            // evaluated variable, track event
        }
        return variable
    }


    const variableKey = 'feature-release'
    const variableKeyString = 'variable-key-string'
    const variableKeyNumber = 'variable-key-number'
    const variableKeyBoolean = 'variable-key-boolean'
    const variableKeyJsonString = 'variable-json-key-string'

    const variable = useVariableWithTracking(variableKey, true)
    const variableString = useVariableWithTracking(variableKeyString, 'default')
    const variableNumber = useVariableWithTracking(variableKeyNumber, 100)
    const variableBoolean = useVariableWithTracking(variableKeyBoolean, true)
    const variableJsonString = useVariableWithTracking(
        variableKeyJsonString,
        { 'jsonStringKeyDefault': 'json string default' }
    )

    return (
        <div>
            <div>
                <span>React With Provider</span>
            </div>
            <div>
                <span>variable feature-release = {JSON.stringify(variable.value)} </span>
            </div>
            <div>
                <span>variable variable-key-string = {JSON.stringify(variableString.value)} </span>
            </div>
            <div>
                <span>variable variable-key-number = {JSON.stringify(variableNumber.value)} </span>
            </div>
            <div>
                <span>variable variable-key-boolean = {JSON.stringify(variableBoolean.value)}
                </span>
            </div>
            <div>
                <span>variable variable-json-key-string = {JSON.stringify(variableJsonString.value)} </span>
            </div>
        </div>
    )
}

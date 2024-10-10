import {
    RenderIfEnabled,
    SwapComponents,
    useVariable,
} from '@devcycle/react-client-sdk'
import React from 'react'

const OldComponent = ({ text }: { text: string }) => {
    return <div>Old Component: {text}</div>
}

const RefactoredComponent = ({ text }: { text: string }) => {
    return <div>Refactored Component: {text}</div>
}

const MyComponent = SwapComponents(
    OldComponent,
    RefactoredComponent,
    'test-featre',
)

export default function DevCycleExample(): React.ReactElement {
    const variableKey = 'feature-release'
    const variableKeyString = 'variable-key-string'
    const variableKeyNumber = 'variable-key-number'
    const variableKeyBoolean = 'variable-key-boolean'
    const variableKeyJsonString = 'variable-json-key-string'

    const variable = useVariable(variableKey, true)
    const variableString = useVariable(variableKeyString, 'default')
    const variableNumber = useVariable(variableKeyNumber, 100)
    const variableBoolean = useVariable(variableKeyBoolean, true)
    const variableJsonString = useVariable(variableKeyJsonString, {
        jsonStringKeyDefault: 'json string default',
    })

    return (
        <div>
            <div>
                <span>React With Provider</span>
            </div>
            <div>
                <span>
                    variable feature-release = {JSON.stringify(variable.value)}{' '}
                </span>
            </div>
            <RenderIfEnabled variableKey={'test-featre'}>
                <div>
                    <span>This content is conditionally rendered.</span>
                </div>
            </RenderIfEnabled>
            <MyComponent text={'Hello'} />
            <div>
                <span>
                    variable variable-key-string ={' '}
                    {JSON.stringify(variableString.value)}{' '}
                </span>
            </div>
            <div>
                <span>
                    variable variable-key-number ={' '}
                    {JSON.stringify(variableNumber.value)}{' '}
                </span>
            </div>
            <div>
                <span>
                    variable variable-key-boolean ={' '}
                    {JSON.stringify(variableBoolean.value)}
                </span>
            </div>
            <div>
                <span>
                    variable variable-json-key-string ={' '}
                    {JSON.stringify(variableJsonString.value)}{' '}
                </span>
            </div>
        </div>
    )
}

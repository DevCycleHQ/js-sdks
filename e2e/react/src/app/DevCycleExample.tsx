import { useVariable } from '@devcycle/react-client-sdk'
import React from 'react'

export default function DevCycleExample(): React.ReactElement {
    const variableKey = 'enabled-feature'
    const variableKey2 = 'disabled-feature'
    const variableKey3 = 'default-feature'

    const variable = useVariable(variableKey, false)
    const variable2 = useVariable(variableKey2, true)
    const variable3 = useVariable(variableKey3, true)

    return (
        <div>
            <div>
                <span>React With Provider</span>
            </div>
            <div>
                <span>
                    variable enabled-feature = {JSON.stringify(variable.value)}{' '}
                </span>
            </div>
            <div>
                <span>
                    variable disabled-feature ={' '}
                    {JSON.stringify(variable2.value)}{' '}
                </span>
            </div>
            <div>
                <span>
                    variable default-feature = {JSON.stringify(variable3.value)}{' '}
                </span>
            </div>
        </div>
    )
}

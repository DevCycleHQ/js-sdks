import { useVariable } from '@devcycle/devcycle-react-sdk'
import React from 'react'

export default function DevCycleExample(): React.ReactElement {
    const variableKey = 'test'
    const variable = useVariable(variableKey, false)

    return (
        <div>
            <span> Your variable is {variable?.value ? 'ON' : 'OFF'} </span>
        </div>
    )
}

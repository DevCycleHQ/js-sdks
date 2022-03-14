import { useVariable, useDVCClient } from '@devcycle/devcycle-react-sdk'
import Button from 'react-bootstrap/Button'
import React from 'react'

export default function DevCycleExample() {
  const variableKey = 'jasons-feature'
  const variable = useVariable(variableKey, true)
  const client = useDVCClient()

  const identify = () => {
    client?.identifyUser({
      user_id: 'jasons-id',

      isAnonymous: false
    })
  }

  return (
    <div>
      <span> Your variable is {variable.value ? 'ON' : 'OFF'} </span>
      <div>
        <Button variant="primary" onClick={identify}>Identify User</Button>{' '}
      </div>
    </div>
  )
}

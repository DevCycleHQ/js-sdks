import logo from './logo.svg';
import './App.css';
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button';
import { withDVCProvider, useDVCClient, useVariable } from '@devcycle/devcycle-react-sdk'
import React, { useState } from 'react'

const user = {
  user_id: 'user1',
  isAnonymous: false
}

const featureForCoolPeopleKey = 'show-feature-for-cool-people'

const track = (client) => {
  client.track({
    type: 'my_custom_event'
  })
}

const identifyUser = (client, setCoolness) => {
  const newUser = {
    user_id: 'newuser-cool',
    isAnonymous: false
  }
  client.identifyUser(newUser, (err, variables) => {
    console.log('identified user!', variables)
    setCoolness(variables[featureForCoolPeopleKey]?.value)
  })
}

const getAllFeatures = (client) => {
  const features = client.allFeatures()
  const variables = client.allVariables()
  console.log('~~~~~ Features ~~~~~~')
  console.dir(features)
  console.log('~~~~~ Variables ~~~~~~')
  console.dir(variables)
}

const resetUser = (client, setCoolness) => {
  client.resetUser((err, variables) => {
    console.log('Finished resetting user!')
    setCoolness(variables[featureForCoolPeopleKey]?.value)
  })
}

function App() {
  const client = useDVCClient()
  const variable = useVariable(featureForCoolPeopleKey, false)
  const [coolness, setCoolness] = useState(variable?.value)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {coolness ? 'A very cool person!' : 'Not a very cool person'}
        </p>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button onClick={() => identifyUser(client, setCoolness)}>Identify User</Button>
          <Button onClick={() => resetUser(client, setCoolness)}>Reset User</Button>
          <Button onClick={() => getAllFeatures(client)}>All Features / Variables</Button>
          <Button onClick={() => track(client)}>Track Event</Button>
        </ButtonGroup>
      </header>
    </div>
  );
}

export default withDVCProvider({
  // envKey: 'client-23ab3cee-85c0-4929-8d56-657fd9d8e6ff',
  envKey: 'client-ed2daf14-82d5-47f6-8a73-a5c298546efa',
  user,
})(App)

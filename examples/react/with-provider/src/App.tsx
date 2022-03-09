import React from 'react'
import logo from './logo.svg'
import './App.css'
import { withDVCProvider } from '@devcycle/devcycle-react-sdk'
import DevCycleExample from './DevCycleExample'

const ENV_KEY = 'test_token'
const user = {
  user_id: 'test-user',
  isAnonymous: false
}

function App() {
  return (
    <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Update the <code>ENV_KEY</code> and <code>user_id</code> fields
            inside <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <DevCycleExample />
        </header>
    </div>
  );
}

export default withDVCProvider({envKey: ENV_KEY, user: user })(App);

import React from 'react'
import logo from './logo.svg'
import './App.css'
import {
    useIsDevCycleInitialized,
    withDevCycleProvider,
} from '@devcycle/react-client-sdk'
import DevCycleExample from './DevCycleExample'
import { DevCycleDebugger } from '@devcycle/web-debugger/react'

const SDK_KEY = ''
const user = {
    user_id: 'userId12',
    email: 'auto@taplytics.com',
    customData: {
        cps: 'Matthew',
        cpn: 777,
        cpb: true,
    },
    isAnonymous: false,
}

function App() {
    const devcycleReady = useIsDevCycleInitialized()

    if (!devcycleReady) {
        return (
            <div>
                <h1>DevCycle is not ready!</h1>
            </div>
        )
    }

    return (
        <div className="App">
            <DevCycleDebugger
                debuggerUrl={'http://localhost:4201'}
                position={'right'}
            />

            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Update the <code>SDK_KEY</code> and <code>user_id</code>{' '}
                    fields inside <code>src/App.tsx</code> and save to reload.
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
    )
}

export default withDevCycleProvider({
    sdkKey: SDK_KEY,
    user: user,
    options: { logLevel: 'debug' },
})(App)

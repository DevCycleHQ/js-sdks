import React from 'react'
import logo from './logo.svg'
import './App.css'
import {
    useIsDVCInitialized,
    withDVCProvider,
} from '@devcycle/devcycle-react-sdk'
import DevCycleExample from './DevCycleExample'

const SDK_KEY = process.env.NX_CLIENT_KEY || '<YOUR_DVC_CLIENT_SDK_KEY>'
const user = {
    user_id: 'userId1',
    email: 'auto@taplytics.com',
    customData: {
        cps: 'Matthew',
        cpn: 777,
        cpb: true,
    },
    isAnonymous: false,
}

function App() {
    const dvcReady = useIsDVCInitialized()

    if (!dvcReady)
        return (
            <div>
                <h1>DVC is not ready!</h1>
            </div>
        )

    return (
        <div className="App">
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

export default withDVCProvider({
    sdkKey: SDK_KEY,
    user: user,
    options: { logLevel: 'debug' },
})(App)

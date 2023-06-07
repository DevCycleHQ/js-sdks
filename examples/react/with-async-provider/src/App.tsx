import React from 'react'
import logo from './logo.svg'
import './App.css'
import DevCycleExample from './DevCycleExample'

function App(): React.ReactElement {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Update the <code>SDK_KEY</code> and <code>user_id</code>{' '}
                    fields inside <code>src/index.tsx</code> and save to reload.
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

export default App

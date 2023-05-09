import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { asyncWithDVCProvider } from '@devcycle/devcycle-react-sdk';

(async () => {
    const ENV_KEY = process.env['NX_CLIENT_KEY'] || 'test_token'
    const user = { 
        user_id: 'userId1',
        isAnonymous: false
    }
    const DVCProvider = await asyncWithDVCProvider({ envKey: ENV_KEY, user: user  })

    ReactDOM.render(
        <React.StrictMode>
            <DVCProvider>
                <App />
            </DVCProvider>
        </React.StrictMode>,
        document.getElementById('root')
    )
})()


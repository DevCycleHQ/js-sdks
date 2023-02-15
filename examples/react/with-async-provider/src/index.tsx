import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { asyncWithDVCProvider } from '@devcycle/devcycle-react-sdk';

(async () => {
    const SDK_KEY = process.env['NX_CLIENT_KEY'] || 'test_token'
    const user = {
        user_id: 'userId1',
        email: 'auto@taplytics.com',
        customData: {
            cps: 'Matthew',
            cpn: 777,
            cpb: true
        },
        isAnonymous: false
    }
    const DVCProvider = await asyncWithDVCProvider({ sdkKey: SDK_KEY, user: user  })

    ReactDOM.render(
        <React.StrictMode>
            <DVCProvider>
                <App />
            </DVCProvider>
        </React.StrictMode>,
        document.getElementById('root')
    )
})()


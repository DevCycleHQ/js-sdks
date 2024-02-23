// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css'

import NxWelcome from './nx-welcome'
import { withDevCycleProvider } from '@devcycle/react-client-sdk'

const SDK_KEY =
    process.env.DEVCYCLE_CLIENT_SDK_KEY || '<DEVCYCLE_CLIENT_SDK_KEY>'

export function App() {
    return (
        <div>
            <NxWelcome title="examples-debugger-widget" />
        </div>
    )
}

export default withDevCycleProvider({
    sdkKey: SDK_KEY,
    user: { user_id: 'test_user' },
    options: { logLevel: 'debug' },
})(App)

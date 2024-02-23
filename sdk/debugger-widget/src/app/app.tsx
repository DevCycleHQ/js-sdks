// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css'

import NxWelcome from './nx-welcome'
import { useEffect, useState } from 'react'
import { Debugger } from './Debugger'
import { DebuggerData } from './types'

export function App() {
    const [data, setData] = useState<DebuggerData | null>(null)

    useEffect(() => {
        const messageListener = (event: MessageEvent) => {
            console.log('MESSAGE', event.data)
            if (event.data.type !== 'dvcDebuggerData') return
            console.log('SETTING DATA', event.data)
            setData(event.data)
        }
        window.addEventListener('message', messageListener)
        return () => {
            window.removeEventListener('message', messageListener)
        }
    }, [])

    console.log('DATA', data)

    return <Debugger data={data} />
}

export default App

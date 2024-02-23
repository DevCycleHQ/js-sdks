'use client'
import { useEffect, useState } from 'react'
import { Debugger } from './Debugger'
import { DebuggerData } from './types'

export default function Index({
    selfTargeting,
}: {
    selfTargeting: React.ReactNode
}) {
    /*
     * Replace the elements below with your own.
     *
     * Note: The corresponding styles are in the ./index.css file.
     */
    const [data, setData] = useState<DebuggerData | null>(null)

    useEffect(() => {
        const messageListener = (event: MessageEvent) => {
            if (event.data.type !== 'dvcDebuggerData') return
            setData(event.data)
        }
        window.addEventListener('message', messageListener)
        return () => {
            window.removeEventListener('message', messageListener)
        }
    }, [])

    return <Debugger data={data} selfTargeting={selfTargeting} />
}

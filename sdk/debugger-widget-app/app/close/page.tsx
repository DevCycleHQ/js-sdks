'use client'
import { useEffect } from 'react'

export default function Close() {
    useEffect(() => {
        window.close()
    }, [])
    return <div>Done!</div>
}

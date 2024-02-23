import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export const LoginScreen = () => {
    const [clicked, setClicked] = useState(false)
    const searchParams = useSearchParams()
    const openLoginWindow = () => {
        setClicked(true)
        window.open(
            `/api/auth/login?org_id=${searchParams.get('org_id')}`,
            '_blank',
            'width=800,height=600',
        )
    }
    useEffect(() => {
        if (!clicked) return
        const checkInterval = setInterval(async () => {
            const result = await fetch('/api/auth/updateSession')
            if (result.status === 200) {
                window.location.reload()
            }
        }, 1000)
        return () => {
            clearInterval(checkInterval)
        }
    }, [clicked])

    return (
        <div
            className={
                'w-full flex flex-row justify-center h-full items-center'
            }
        >
            <div
                onClick={openLoginWindow}
                className={
                    'rounded-md bg-blue-400 py-2 px-5 text-white cursor-pointer'
                }
            >
                Login
            </div>
        </div>
    )
}

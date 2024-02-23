import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect, useState } from 'react'

const Logout = () => {
    const logout = () => {
        setClicked(true)
        window.open('/api/auth/logout', '_blank', 'width=800,height=600')
    }
    const [clicked, setClicked] = useState(false)

    useEffect(() => {
        if (!clicked) return
        const checkInterval = setInterval(async () => {
            const result = await fetch('/api/auth/updateSession')
            if (result.status !== 200) {
                window.location.reload()
            }
        }, 1000)
        return () => {
            clearInterval(checkInterval)
        }
    })

    return (
        <div
            onClick={logout}
            className={
                'text-center bg-blue-500 rounded-lg grow-0 basis-0 px-3 mt-1'
            }
        >
            Logout
        </div>
    )
}

export const Header = () => {
    const { user } = useUser()

    return (
        <div
            className={
                'flex flex-row items-center justify-between bg-dvcblue text-white py-4 px-4 sticky top-0 w-full rounded-t-3xl h-[70px]'
            }
        >
            <div className={'font-bold text-lg'}>DevCycle Debugger</div>
            <div className={'flex flex-col items-center'}>
                <div className={'flex flex-row items-center gap-3'}>
                    <div>{user!.name}</div>
                    <img
                        src={user!.picture}
                        alt={user!.name}
                        className={'rounded-full w-10 h-10'}
                    />
                </div>
                {/*<Logout />*/}
            </div>
        </div>
    )
}

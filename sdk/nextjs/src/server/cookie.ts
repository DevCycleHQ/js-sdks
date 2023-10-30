import { cookies } from 'next/headers'
import { cookieName, DVCCookie } from '../common/cookie'

export const getDVCCookie = (): DVCCookie | undefined => {
    const cookie = cookies().get(cookieName)
    if (cookie) {
        return JSON.parse(cookie.value) as DVCCookie
    }
}

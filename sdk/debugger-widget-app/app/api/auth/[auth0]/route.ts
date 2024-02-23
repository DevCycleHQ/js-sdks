import {
    handleAuth,
    handleCallback,
    handleLogin,
    handleLogout,
    handleProfile,
} from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

export const GET = handleAuth({
    login: async (req: NextApiRequest, res: NextApiResponse) => {
        const url = new URL(req.url!)
        const org_id = url.searchParams.get('org_id')
        const newUrl = new URL('/close', url.origin)
        return await handleLogin(req, res, {
            authorizationParams: {
                organization: org_id || undefined,
                audience: 'https://api.devcycle.com/',
                scope: 'openid profile email offline_access',
            },
            returnTo: newUrl.toString(),
        })
    },
    async callback(req: NextApiRequest, res: NextApiResponse) {
        const url = new URL(req.url!)
        const newUrl = new URL('/close', url.origin)
        return await handleCallback(req, res, {
            redirectUri: newUrl.toString(),
        })
    },
    logout: async (req: NextApiRequest, res: NextApiResponse) => {
        const url = new URL(req.url!)
        const returnTo = new URL('/close', url.origin)
        return await handleLogout(req, res, { returnTo: returnTo.toString() })
    },
    updateSession: async (req: NextApiRequest, res: NextApiResponse) => {
        return await handleProfile(req, res, { refetch: true })
    },
})

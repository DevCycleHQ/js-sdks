import { NextRequest } from 'next/server'
import { DevCycleMiddleware } from '@devcycle/next-sdk/server'

export function middleware(request: NextRequest) {
    return DevCycleMiddleware('client-c3b75096-70bb-47b8-9898-4f145f2caa26')(
        request,
    )
}

import { NextResponse } from 'next/server'
import { getVariableValue } from './app/normal/devcycle'

export const middleware = async () => {
    const response = NextResponse.next()
    const variableValue = await getVariableValue('enabled-feature', false)

    // Add custom header
    response.headers.set(
        'Middleware-Enabled-Feature',
        JSON.stringify(variableValue),
    )

    return response
}

export const config = {
    matcher: '/normal',
}

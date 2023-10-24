// src/mocks/handlers.js
import { http, HttpResponse } from 'msw'

export const handlers = [
    http.post(
        'https://bucketing-api.devcycle.com/v1/variables/test-key-not-in-config',
        () => {
            return HttpResponse.json({}, { status: 404 })
        },
    ),
    http.post(
        'https://bucketing-api.devcycle.com/v1/variables/test-key',
        async ({ request }) => {
            const body = await request.json()
            const { user_id } = body as Record<string, any>
            const url = new URL(request.url)
            const enableEdgeDB = url.searchParams.get('enableEdgeDB')

            if (user_id === '500') {
                return HttpResponse.json({}, { status: 500 })
            }

            if (enableEdgeDB) {
                return HttpResponse.json(
                    {
                        key: 'test-key-edgedb',
                        value: true,
                        type: 'Boolean',
                        defaultValue: false,
                    },
                    { status: 200 },
                )
            } else {
                return HttpResponse.json(
                    {
                        key: 'test-key',
                        value: true,
                        type: 'Boolean',
                        defaultValue: false,
                    },
                    { status: 200 },
                )
            }
        },
    ),
    http.post(
        'https://bucketing-api.devcycle.com/v1/variables',
        async ({ request }) => {
            const body = await request.json()
            const { user_id } = body as Record<string, any>
            const url = new URL(request.url)
            const enableEdgeDB = url.searchParams.get('enableEdgeDB')

            if (user_id === 'bad') {
                return HttpResponse.json({}, { status: 400 })
            } else if (user_id === '500') {
                return HttpResponse.json({}, { status: 500 })
            } else if (user_id === 'empty') {
                return HttpResponse.json({}, { status: 200 })
            } else {
                if (enableEdgeDB) {
                    return HttpResponse.json(
                        {
                            'test-key-edgedb': {
                                key: 'test-key-edgedb',
                                value: true,
                                type: 'Boolean',
                                defaultValue: false,
                            },
                        },
                        { status: 200 },
                    )
                } else {
                    return HttpResponse.json(
                        {
                            'test-key': {
                                key: 'test-key',
                                value: true,
                                type: 'Boolean',
                                defaultValue: false,
                            },
                        },
                        { status: 200 },
                    )
                }
            }
        },
    ),
    http.post(
        'https://bucketing-api.devcycle.com/v1/features',
        async ({ request }) => {
            const body = await request.json()
            const { user_id } = body as Record<string, any>
            const url = new URL(request.url)
            const enableEdgeDB = url.searchParams.get('enableEdgeDB')

            if (user_id === 'bad') {
                return HttpResponse.json({}, { status: 400 })
            } else if (user_id === '500') {
                return HttpResponse.json({}, { status: 500 })
            } else if (user_id === 'empty') {
                return HttpResponse.json({}, { status: 200 })
            } else {
                if (enableEdgeDB) {
                    return HttpResponse.json(
                        {
                            'test-feature-edgedb': {
                                _id: 'test-id',
                                _variation: 'variation-id',
                                variationKey: 'variationKey',
                                variationName: 'Variation Name',
                                key: 'test-feature-edgedb',
                                type: 'release',
                            },
                        },
                        { status: 200 },
                    )
                } else {
                    return HttpResponse.json(
                        {
                            'test-feature': {
                                _id: 'test-id',
                                _variation: 'variation-id',
                                variationKey: 'variationKey',
                                variationName: 'Variation Name',
                                key: 'test-feature',
                                type: 'release',
                            },
                        },
                        { status: 200 },
                    )
                }
            }
        },
    ),
    http.post(
        'https://bucketing-api.devcycle.com/v1/track',
        async ({ request }) => {
            const body = await request.json()
            const { user } = body as Record<string, any>

            if (user.user_id === 'bad') {
                return HttpResponse.json({}, { status: 400 })
            } else {
                return HttpResponse.json({}, { status: 201 })
            }
        },
    ),
]

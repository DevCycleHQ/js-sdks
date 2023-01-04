// src/mocks/handlers.js
import { rest } from 'msw'

export const handlers = [
    rest.post('https://bucketing-api.devcycle.com/v1/variables/test-key-not-in-config', (req, res, ctx) => {
        return res(
            ctx.status(404),
            ctx.json({})
        )
    }),
    rest.post('https://bucketing-api.devcycle.com/v1/variables/test-key', (req, res, ctx) => {
        const enableEdgeDB = req.url.searchParams.get('enableEdgeDB')
        const { user_id } = req.body as Record<string, any>

        if (user_id === '500') {
            return res(
                ctx.status(500)
            )
        }

        if (enableEdgeDB) {
            return res(
                ctx.status(200),
                ctx.json({
                    key: 'test-key-edgedb',
                    value: true,
                    type: 'Boolean',
                    defaultValue: false
                })
            )
        } else {
            return res(
                ctx.status(200),
                ctx.json({
                    key: 'test-key',
                    value: true,
                    type: 'Boolean',
                    defaultValue: false
                })
            )
        }
    }),
    rest.post('https://bucketing-api.devcycle.com/v1/variables', (req, res, ctx) => {
        const { user_id } = req.body as Record<string, any>
        const enableEdgeDB = req.url.searchParams.get('enableEdgeDB')

        if (user_id === 'bad') {
            return res(
                ctx.status(400)
            )
        } else if (user_id === '500') {
            return res(
                ctx.status(500)
            )
        } else if (user_id === 'empty') {
            return res(
                ctx.status(200),
                ctx.json({})
            )
        } else {
            if (enableEdgeDB) {
                return res(
                    ctx.status(200),
                    ctx.json({
                        'test-key-edgedb': {
                            key: 'test-key-edgedb',
                            value: true,
                            type: 'Boolean',
                            defaultValue: false
                        }
                    })
                )
            } else {
                return res(
                    ctx.status(200),
                    ctx.json({
                        'test-key': {
                            key: 'test-key',
                            value: true,
                            type: 'Boolean',
                            defaultValue: false
                        }
                    })
                )
            }
        }
    }),
    rest.post('https://bucketing-api.devcycle.com/v1/features', (req, res, ctx) => {
        const { user_id } = req.body as Record<string, any>
        const enableEdgeDB = req.url.searchParams.get('enableEdgeDB')

        if (user_id === 'bad') {
            return res(
                ctx.status(400)
            )
        } else if (user_id === '500') {
            return res(
                ctx.status(500)
            )
        } else if (user_id === 'empty') {
            return res(
                ctx.status(200),
                ctx.json({})
            )
        } else {
            if (enableEdgeDB) {
                return res(
                    ctx.status(200),
                    ctx.json({
                        'test-feature-edgedb': {
                            _id: 'test-id',
                            _variation: 'variation-id',
                            variationKey: 'variationKey',
                            variationName: 'Variation Name',
                            key: 'test-feature-edgedb',
                            type: 'release',
                        }
                    })
                )
            } else {
                return res(
                    ctx.status(200),
                    ctx.json({
                        'test-feature': {
                            _id: 'test-id',
                            _variation: 'variation-id',
                            variationKey: 'variationKey',
                            variationName: 'Variation Name',
                            key: 'test-feature',
                            type: 'release',
                        }
                    })
                )
            }
        }
    }),
    rest.post('https://bucketing-api.devcycle.com/v1/track', (req, res, ctx) => {
        const { user } = req.body as Record<string, any>

        if (user.user_id === 'bad') {
            return res(
                ctx.status(400)
            )
        } else {
            return res(
                ctx.status(201)
            )
        }
    })
]
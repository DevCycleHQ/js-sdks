jest.mock('cross-fetch')
import fetch, { Response } from 'cross-fetch'

global.fetch = fetch

const fetchRequestMock = fetch as jest.MockedFn<typeof fetch>

import { post, get } from '../src/request'

describe('request.ts Unit Tests', () => {
    beforeEach(() => {
        fetchRequestMock.mockReset()
    })

    describe('get', () => {
        it('should make GET request', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 200 }),
            )
            await get('https://test.com', {})
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'GET',
                }),
            )
        })

        it('should fail on GET request for 500 error', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 500 }),
            )
            await expect(get('https://test.com', {})).rejects.toThrow()
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'GET',
                }),
            )
        })
    })

    describe('post', () => {
        it('should make POST request', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 200 }),
            )
            await post('https://test.com', {}, 'token')
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        Authorization: 'token',
                        'Content-Type': 'application/json',
                    },
                }),
            )
        })

        it('should fail on POST request for 500 error', async () => {
            fetchRequestMock.mockResolvedValue(
                new Response('', { status: 500 }),
            )
            await expect(
                post('https://test.com', {}, 'token'),
            ).rejects.toThrow()
            expect(fetchRequestMock).toBeCalledWith(
                'https://test.com',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        Authorization: 'token',
                        'Content-Type': 'application/json',
                    },
                }),
            )
        })
    })
})

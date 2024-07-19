import { EdgeConfigSource } from './edge-config'
import { fromPartial } from '@total-typescript/shoehorn'

describe('EdgeConfigSource', () => {
    it('sends a request to edge config with the correct key', async () => {
        const get = jest.fn()
        const edgeConfigSource = new EdgeConfigSource(
            fromPartial({
                get,
            }),
        )

        get.mockResolvedValue({
            key: 'value',
            lastModified: 'some date',
        })

        const result = await edgeConfigSource.getConfig('sdk-key', 'server')

        expect(get).toHaveBeenCalledWith('devcycle-config-v1-server-sdk-key')

        expect(result).toEqual([
            { key: 'value', lastModified: 'some date' },
            { resLastModified: 'some date' },
        ])
    })

    it('returns null when the existing config date is newer', async () => {
        const get = jest.fn()
        const edgeConfigSource = new EdgeConfigSource(
            fromPartial({
                get,
            }),
        )

        get.mockResolvedValueOnce({
            key: 'value',
            lastModified: '2024-07-18T14:55:32.720Z',
        })

        get.mockResolvedValueOnce({
            key: 'value',
            lastModified: '2024-07-18T14:12:32.720Z',
        })

        const result = await edgeConfigSource.getConfig('sdk-key', 'server')
        expect(result[0]).not.toBeNull()
        const result2 = await edgeConfigSource.getConfig('sdk-key', 'server')
        expect(result2[0]).toBeNull()
    })

    it('requests the bootstrap config', async () => {
        const get = jest.fn()
        const edgeConfigSource = new EdgeConfigSource(
            fromPartial({
                get,
            }),
        )

        get.mockResolvedValue({
            key: 'value',
            lastModified: 'some date',
        })

        await edgeConfigSource.getConfig('sdk-key', 'bootstrap')

        expect(get).toHaveBeenCalledWith(
            'devcycle-config-v1-server-bootstrap-sdk-key',
        )
    })
})
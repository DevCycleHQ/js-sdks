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

        const result = await edgeConfigSource.getConfig(
            'sdk-key',
            'server',
            false,
        )

        expect(get).toHaveBeenCalledWith('devcycle-config-v1-server-sdk-key')

        expect(result).toEqual({
            config: { key: 'value', lastModified: 'some date' },
            lastModified: 'some date',
            metaData: { resLastModified: 'some date' },
        })
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

        const result = await edgeConfigSource.getConfig(
            'sdk-key',
            'server',
            false,
        )
        expect(result.config).not.toBeNull()
        const result2 = await edgeConfigSource.getConfig(
            'sdk-key',
            'server',
            false,
        )
        expect(result2.config).toBeNull()
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

        await edgeConfigSource.getConfig('sdk-key', 'bootstrap', false)

        expect(get).toHaveBeenCalledWith(
            'devcycle-config-v1-server-bootstrap-sdk-key',
        )
    })

    it('requests the obfuscated bootstrap config', async () => {
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

        await edgeConfigSource.getConfig('sdk-key', 'bootstrap', true)

        expect(get).toHaveBeenCalledWith(
            'devcycle-config-v1-server-bootstrap-obfuscated-sdk-key',
        )
    })
})

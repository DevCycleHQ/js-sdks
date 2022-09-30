import { ConfigRequestConsolidator } from '../src/ConfigRequestConsolidator'

const requestFn = jest.fn()
const receiveFn = jest.fn()

describe('ConfigRequestConsolidator Tests', () => {
    let requestConsolidator

    beforeEach(() => {
        jest.resetAllMocks()
        requestConsolidator = new ConfigRequestConsolidator(
            requestFn,
            receiveFn,
            {
                user_id: 'initial'
            }
        )
    })

    it('calls request fn using provided user and then calls response fn', async () => {
        requestFn.mockResolvedValue('test')
        const result = await requestConsolidator.queue({user_id: 'user1'})
        expect(requestFn).toHaveBeenCalledWith({user_id: 'user1'})
        expect(receiveFn).toHaveBeenCalledWith('test', {user_id: 'user1'})
        expect(result).toEqual('test')
    })

    it('queues extra operations and only calls the latest one, resolving all promises correctly', async () => {
        requestFn.mockResolvedValueOnce('test1')
        requestFn.mockResolvedValueOnce('test2')
        const promise1 = requestConsolidator.queue({user_id: 'user1'})
        const promise2 = requestConsolidator.queue({user_id: 'user2'})
        const promise3 = requestConsolidator.queue({user_id: 'user3'})

        const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])
        expect(requestFn).toHaveBeenCalledTimes(2)
        expect(requestFn).toHaveBeenCalledWith({user_id: 'user1'})
        expect(requestFn).toHaveBeenCalledWith({user_id: 'user3'})
        expect(receiveFn).toHaveBeenCalledWith('test1', {user_id: 'user1'})
        expect(receiveFn).toHaveBeenCalledWith('test2', {user_id: 'user3'})
        expect(result1).toEqual('test1')
        expect(result2).toEqual('test2')
        expect(result3).toEqual('test2')
    })

    it('processes failures correctly', async () => {
        requestFn.mockRejectedValueOnce('test1')
        requestFn.mockResolvedValueOnce('test2')
        const promise1 = requestConsolidator.queue({user_id: 'user1'})
        const promise2 = requestConsolidator.queue({user_id: 'user2'})

        await expect(promise1).rejects.toEqual('test1')
        const result2 = await promise2

        expect(requestFn).toHaveBeenCalledTimes(2)
        expect(requestFn).toHaveBeenCalledWith({user_id: 'user1'})
        expect(requestFn).toHaveBeenCalledWith({user_id: 'user2'})
        expect(receiveFn).toHaveBeenCalledTimes(1)
        expect(receiveFn).toHaveBeenCalledWith('test2', {user_id: 'user2'})
        expect(result2).toEqual('test2')
    })

    it('processes failure of queued operation correctly', async () => {
        requestFn.mockResolvedValueOnce('test1')
        requestFn.mockRejectedValueOnce('test2')
        const promise1 = requestConsolidator.queue({user_id: 'user1'})
        const promise2 = requestConsolidator.queue({user_id: 'user2'})

        await expect(promise2).rejects.toEqual('test2')
        const result1 = await promise1

        expect(requestFn).toHaveBeenCalledTimes(2)
        expect(requestFn).toHaveBeenCalledWith({user_id: 'user1'})
        expect(requestFn).toHaveBeenCalledWith({user_id: 'user2'})
        expect(receiveFn).toHaveBeenCalledTimes(1)
        expect(receiveFn).toHaveBeenCalledWith('test1', {user_id: 'user1'})
        expect(result1).toEqual('test1')
    })
})

import { RequestConsolidator } from '../src/RequestConsolidator'

describe('RequestConsolidator Tests', () => {
    const requestConsolidator = new RequestConsolidator()

    it('should return the latest result of the same type', async () => {
        const promise1 = new Promise((resolve, _) => {
            setTimeout(() => resolve(1), 200)
        })
        const promise2 = new Promise((resolve, _) => {
            setTimeout(() => resolve(2), 200)
        })
        const resultPromise1 = requestConsolidator.queue('identify', promise1)
        const resultPromise2 = requestConsolidator.queue('identify', promise2)
        const results = await Promise.all([resultPromise1, resultPromise2])
        expect(results[0]).toEqual(results[1])
    })

    it('should return different results for different promises', async () => {
        const promise1 = new Promise((resolve, _) => {
            setTimeout(() => resolve(1), 200)
        })
        const promise2 = new Promise((resolve, _) => {
            setTimeout(() => resolve(2), 200)
        })
        const resultPromise1 = requestConsolidator.queue('identify', promise1)
        const resultPromise2 = requestConsolidator.queue('other-type', promise2)
        const results = await Promise.all([resultPromise1, resultPromise2])
        expect(results[0]).toEqual(1)
        expect(results[1]).toEqual(2)
    })
})
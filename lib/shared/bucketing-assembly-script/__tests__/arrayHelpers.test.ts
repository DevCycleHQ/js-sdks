import { testSortObjectsByString } from '../build/bucketing-lib.debug'

describe('array helpers', () => {
    describe('sortObjectsByString', () => {
        it('sorts correctly for stings of equal length', () => {
            const sortArray = [
                {
                    entry: {key: 'dog2'},
                    value: 'dog2'
                },
                {
                    entry: {key: 'dog1'},
                    value: 'dog1'
                },
                {
                    entry: {key: 'dog3'},
                    value: 'dog3'
                }
            ]
            expect(testSortObjectsByString(sortArray))
            .toEqual([{key: 'dog1'}, {key: 'dog2'}, {key: 'dog3'}])
        })
        it('sorts correctly for stings of unequal length', () => {
            const sortArray = [
                {
                    entry: {key: 'doglong'},
                    value: 'doglong'
                },
                {
                    entry: {key: 'dog'},
                    value: 'dog'
                }
            ]
            expect(testSortObjectsByString(sortArray))
                .toEqual([{key: 'dog'}, {key: 'doglong'}])
        })
        it('sorts correctly for stings of unequal length sorted backwards', () => {
            const sortArray = [
                {
                    entry: {key: 'dog'},
                    value: 'dog'
                },
                {
                    entry: {key: 'doglong'},
                    value: 'doglong'
                }
            ]
            expect(testSortObjectsByString(sortArray))
                .toEqual([{key: 'dog'}, {key: 'doglong'}])
        })
        it('sorts correctly for stings that are different', () => {
            const sortArray = [
                {
                    entry: {key: 'dog'},
                    value: 'dog'
                },
                {
                    entry: {key: 'ant'},
                    value: 'ant'
                },
                {
                    entry: {key: 'cat'},
                    value: 'cat'
                }
            ]
            expect(testSortObjectsByString(sortArray))
                .toEqual([{key: 'ant'}, {key: 'cat'}, {key: 'dog'}])
        })
    })
})

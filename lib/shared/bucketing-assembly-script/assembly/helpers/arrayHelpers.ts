class SortingArrayItem<T> {
    value: string
    entry: T
}

export type SortingArray<T> = SortingArrayItem<T>[]

/**
 * Sorts an array of objects that have been preformatted to the "SortingArrayItem" format which includes the original
 * item under the "entry" field, and the value to sort by under the "value" field. Returns a sorted array of "entries"
 * @param arr
 * @param direction - direction to sort by, either 'asc' or 'desc'
 */
export function sortObjectsByString<T>(arr: SortingArray<T>, direction: string): T[] {
    const sorted = arr.sort((a, b) => {
        let cursor = 0

        // advance cursor while characters are the same
        while (a.value.charCodeAt(cursor) === b.value.charCodeAt(cursor) && cursor < a.value.length) {
            cursor++
        }

        // check if we're out of bounds on the first string
        if (isNaN(a.value.charCodeAt(cursor))) {
            // check if we're out of bounds on the second string
            if (isNaN(b.value.charCodeAt(cursor))) {
                // strings are the same length and all characters are identical
                return 0
            } else {
                // second string is longer
                return -1
            }
        }

        if (isNaN(b.value.charCodeAt(cursor))) {
            // first string is longer
            return 1
        }

        // return subtraction of the current cursor position's character codes (which must be different)
        return a.value.charCodeAt(cursor) - b.value.charCodeAt(cursor)
    })

    const result: T[] = []
    for (let i = 0; i < sorted.length; i++) {
        result.push(sorted[i].entry)
    }

    return direction === 'desc' ? result.reverse() : result
}

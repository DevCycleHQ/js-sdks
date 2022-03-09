import { v4 as uuidv4 } from 'uuid'

export class APIKey {
    key: string
    createdAt: Date

    constructor(prefix: string) {
        return {
            key: prefix + uuidv4(),
            createdAt: new Date()
        }
    }
}

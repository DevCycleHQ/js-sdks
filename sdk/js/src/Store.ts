import { DVCLogger } from '@devcycle/types'
import { CacheStore } from './CacheStore'

export class Store extends CacheStore {
    constructor(localStorage: Storage, logger: DVCLogger) {
        super(localStorage, logger)
    }
}

export default Store

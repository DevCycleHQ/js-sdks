import { BucketedUserConfig } from '@devcycle/types'


export class RequestConsolidator {
    promiseMap: { [index: string]: PromiseConsolidator<BucketedUserConfig> }

    constructor() {
        this.promiseMap = {}
    }

    queue(type: string, promise: Promise<BucketedUserConfig>): Promise<BucketedUserConfig> {
        let promiseConsolidator = this.promiseMap[type]
        if (!promiseConsolidator) {
            promiseConsolidator = new PromiseConsolidator(() => {
                delete this.promiseMap[type]
            })
            this.promiseMap[type] = promiseConsolidator
        }
        promiseConsolidator.addPromise(promise)
        return promiseConsolidator.result
    }
}

class PromiseConsolidator<T> {
    currentPromise: Promise<T>
    resolve: (value: T | PromiseLike<T>) => void
    reject: (reason?: any) => void
    finally?: () => void
    result: Promise<T>

    constructor(finallyFunction?: () => void) {
        this.finally = finallyFunction
        this.result = new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
    }

    addPromise(promise: Promise<T>): void {
        this.currentPromise = promise
        promise
            .then((result) => {
                if (promise === this.currentPromise) {
                    this.resolve(result)
                    this.finally?.()
                }
            })
            .catch((error) => {
                this.reject(error)
                this.finally?.()
            })
    }
}
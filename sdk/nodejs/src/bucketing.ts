import { instantiate, Exports } from '@devcycle/bucketing-assembly-script'
import { DVCLogger, DVCReporter } from '@devcycle/types'
import { DevCycleOptions } from './types'

let Bucketing: Exports | null
let bucketingInstantiationCount = 0
const bucketingInstantiationWarning = 3

export const importBucketingLib = async ({
    logger,
    options,
}: { logger?: DVCLogger; options?: DevCycleOptions } = {}): Promise<void> => {
    const debugWASM = process.env.DEVCYCLE_DEBUG_WASM === '1'
    await instantiate(debugWASM).then((exports) => {
        bucketingInstantiationCount++
        if (bucketingInstantiationCount > bucketingInstantiationWarning) {
            logger?.warn(
                `Warning: The DevCycle SDK has been instantiated ${bucketingInstantiationWarning} times. ` +
                    'This may cause higher than expected memory usage and indicate a faulty integration.',
            )
        }
        Bucketing = exports
        return Bucketing
    })
    startTrackingMemoryUsage(logger, options?.reporter)
}

export const startTrackingMemoryUsage = (
    logger?: DVCLogger,
    reporter?: DVCReporter,
    interval: number = 30 * 1000,
): void => {
    if (!reporter) return
    trackMemoryUsage(reporter, logger)
    setInterval(() => trackMemoryUsage(reporter, logger), interval)
}

export const trackMemoryUsage = (
    reporter: DVCReporter,
    logger?: DVCLogger,
): void => {
    if (!reporter) return
    if (!Bucketing) {
        throw new Error('Bucketing lib not initialized')
    }
    const memoryUsageMB = Bucketing.memory.buffer.byteLength / 1e6
    logger?.debug(`WASM memory usage: ${memoryUsageMB} MB`)
    reporter.reportMetric('wasmMemoryMB', memoryUsageMB, {})
}

export const getBucketingLib = (): Exports => {
    if (!Bucketing) {
        throw new Error('Bucketing library not loaded')
    }
    return Bucketing
}

export const cleanupBucketingLib = (): void => {
    Bucketing = null
}

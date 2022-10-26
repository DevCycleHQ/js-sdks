import { instantiate, Exports } from '@devcycle/bucketing-assembly-script'
import { DVCLogger, DVCReporter } from '@devcycle/types'
import { DVCOptions } from './types'

let Bucketing: Exports | null

export const importBucketingLib = async (
    { logger, options }:
    { logger?: DVCLogger, options?: DVCOptions } = {}
): Promise<void> => {
    Bucketing = await instantiate()
    startTrackingMemoryUsage(Bucketing, logger, options?.reporter)
}

export const startTrackingMemoryUsage = (
    Bucketing: Exports,
    logger?: DVCLogger,
    reporter?: DVCReporter,
    interval: number = 30 * 1000
): void => {
    if (!reporter) return
    trackMemoryUsage(Bucketing, reporter, logger)
    setInterval(() => trackMemoryUsage(Bucketing, reporter, logger), interval)
}

export const trackMemoryUsage = (
    Bucketing: Exports,
    reporter: DVCReporter,
    logger?: DVCLogger,
): void => {
    if (!reporter) return
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

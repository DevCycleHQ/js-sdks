import { instantiate, Exports } from '@devcycle/bucketing-assembly-script'
import {
    DVCLogger,
    DVCReporter,
    DevCycleServerSDKOptions,
} from '@devcycle/types'

export const importBucketingLib = async ({
    logger,
    options,
}: {
    logger?: DVCLogger
    options?: DevCycleServerSDKOptions
} = {}): Promise<[Exports, NodeJS.Timer | undefined]> => {
    const debugWASM = process.env.DEVCYCLE_DEBUG_WASM === '1'
    const result = await instantiate(debugWASM)
    const interval = startTrackingMemoryUsage(result, logger, options?.reporter)
    return [result, interval]
}

export const startTrackingMemoryUsage = (
    bucketing: Exports,
    logger?: DVCLogger,
    reporter?: DVCReporter,
    interval: number = 30 * 1000,
): NodeJS.Timer | undefined => {
    if (!reporter) return
    trackMemoryUsage(bucketing, reporter, logger)
    return setInterval(
        () => trackMemoryUsage(bucketing, reporter, logger),
        interval,
    )
}

export const trackMemoryUsage = (
    bucketing: Exports,
    reporter: DVCReporter,
    logger?: DVCLogger,
): void => {
    if (!reporter) return
    const memoryUsageMB = bucketing.memory.buffer.byteLength / 1e6
    logger?.debug(`WASM memory usage: ${memoryUsageMB} MB`)
    reporter.reportMetric('wasmMemoryMB', memoryUsageMB, {})
}

export const setConfigDataUTF8 = (
    bucketing: Exports,
    sdkKey: string,
    projectConfigStr: string,
): void => {
    const configBuffer = Buffer.from(projectConfigStr, 'utf8')
    bucketing.setConfigDataUTF8(sdkKey, configBuffer)
}

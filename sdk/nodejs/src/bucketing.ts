import { instantiate, Exports } from '@devcycle/bucketing-assembly-script'
import { DVCLogger, DVCReporter } from '@devcycle/types'
import { DVCOptions } from './types'

let Bucketing: Exports | null
let InstantiatePromise: Promise<Exports> | null

export const importBucketingLib = async ({
  logger,
  options,
}: { logger?: DVCLogger; options?: DVCOptions } = {}): Promise<void> => {
  if (InstantiatePromise) {
    await InstantiatePromise
    return
  }
  const debugWASM = options?.logLevel === 'debug'
  InstantiatePromise = instantiate(debugWASM).then((exports) => {
    Bucketing = exports
    return Bucketing
  })
  await InstantiatePromise
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

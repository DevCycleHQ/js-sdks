import { instantiate, Exports, getWASMFileData } from '@devcycle/bucketing-assembly-script'
import { DVCLogger, DVCReporter } from '@devcycle/types'
import { DVCOptions } from './types'
// import { analysis } from "as-heap-analyzer/dist/index.js";

let Bucketing: Exports | null
let InstantiatePromise: Promise<Exports> | null

export const importBucketingLib = async (
    { logger, options }:
    { logger?: DVCLogger, options?: DVCOptions } = {}
): Promise<void> => {
    if (InstantiatePromise) {
        await InstantiatePromise
        return
    }
    InstantiatePromise = instantiate(true).then((exports) => {
        Bucketing = exports
        return Bucketing
    })
    await InstantiatePromise
    startTrackingMemoryUsage(logger, options?.reporter)
}

export const startTrackingMemoryUsage = (
    logger?: DVCLogger,
    reporter?: DVCReporter,
    interval: number = 10 * 1000
): void => {
    if (!reporter) return
    setTimeout(() => {
        trackMemoryUsage(reporter, logger)
        setInterval(() => trackMemoryUsage(reporter, logger), interval)
    }, interval)
}

let firstMemoryUsage: Map<string, number> | null = null
let lastMemoryUsage: Map<string, number> | null = null

const diffMaps = (map1: Map<string, number>, map2: Map<string, number>) => {
    const diff: Record<string, number> = {}
    for (const key of map2.keys()) {
        const value1 = map1.get(key)
        const value2 = map2.get(key)

        if (!value1 && value2) {
            diff[key] = value2
        } else if (value1 && value2) {
            diff[key] = value2 - value1
        }
    }

    const keys = Object.keys(diff).sort((a, b) => diff[b] - diff[a])
    keys.filter((key) => diff[key] !== 0).forEach((key) => {
        const value = diff[key]
        console.log(`${key} use ${value} bytes`)
    })

    // console.log('Diff from first memory usage:')
    // console.log(diff)
}

export const trackMemoryUsage = async (
    reporter: DVCReporter,
    logger?: DVCLogger,
): Promise<void> => {
    if (!reporter) return
    if (!Bucketing) {
        throw new Error('Bucketing lib not initialized')
    }

    const memoryUsageMB = Bucketing.memory.buffer.byteLength / 1e6
    logger?.debug(`WASM memory usage: ${memoryUsageMB} MB`)
    reporter.reportMetric('wasmMemoryMB', memoryUsageMB, {})

    const { analysis } = await import('as-heap-analyzer/dist/index.js')
    const memoryUsage = analysis(new Uint8Array(Bucketing.memory.buffer), getWASMFileData())
    if (!firstMemoryUsage) {
        firstMemoryUsage = memoryUsage
        lastMemoryUsage = memoryUsage
    } else {
        console.log('Diff from first memory usage:')
        diffMaps(firstMemoryUsage, memoryUsage)
        console.log('Diff from last memory usage:')
        if (lastMemoryUsage) diffMaps(lastMemoryUsage, memoryUsage)
        lastMemoryUsage = memoryUsage
    }

    // console.log(JSON.stringify(memoryUsage, replacer))
    // memoryUsage.forEach((v, k) => console.log(`${k} use ${v} bytes`))
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

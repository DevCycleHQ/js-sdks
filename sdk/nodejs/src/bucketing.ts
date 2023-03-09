import { instantiate, Exports } from '@devcycle/bucketing-assembly-script'
import { DVCLogger, DVCReporter } from '@devcycle/types'
import { DVCOptions } from './types'
import protobuf, { Type } from 'protobufjs'
import path from 'path'

let Bucketing: Exports | null
let InstantiatePromise: Promise<Exports> | null
export let VariableForUserParams_PB: Type
export let SDKVariable_PB: Type

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
    interval: number = 30 * 1000
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
    loadProtobufTypes()
    return Bucketing
}

function loadProtobufTypes() {
    if (VariableForUserParams_PB) return
    const protoFile = '../../../../lib/shared/bucketing-assembly-script/protobuf/variableForUserParams.proto'
    const filePath = path.resolve(__dirname, protoFile)
    console.log(`Loading protobuf types from ${filePath}`)
    const root = protobuf.loadSync(filePath)
    VariableForUserParams_PB = root.lookupType('VariableForUserParams_PB')
    if (!VariableForUserParams_PB) throw new Error('Protobuf type VariableForUserParams_PB not found')

    SDKVariable_PB = root.lookupType('SDKVariable_PB')
    if (!SDKVariable_PB) throw new Error('Protobuf type SDKVariable_PB not found')
}

export const cleanupBucketingLib = (): void => {
    Bucketing = null
}

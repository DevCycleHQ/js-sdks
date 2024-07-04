import { __AdaptedExports } from './build/bucketing-lib.release'

export * as ProtobufTypes from './protobuf/compiled'

export const instantiate: (
    debug: boolean = false,
    imports: any = {},
) => Promise<typeof __AdaptedExports>

export type Exports = typeof __AdaptedExports
export type WASMBucketingExports = Exports

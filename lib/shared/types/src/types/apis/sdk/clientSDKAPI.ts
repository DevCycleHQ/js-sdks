import isString from 'lodash/isString'
import {
    PublicEnvironment,
    PublicFeature,
    PublicProject,
    PublicVariable,
} from '../../config/configBody'
import type { VariableValue } from '../../config/models'
import {
    IsDate,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsString,
    IsIn,
    IsNotEmpty,
    IsISO31661Alpha2,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import 'reflect-metadata'
import { IsDVCCustomDataJSONObject } from '../../validators/dvcCustomDataJSON'
import { IsNotBlank } from '../../validators/isNotBlank'
import { IsISO6391 } from '../../validators/isIso6391'

export const SDKTypeValues = ['client', 'server', 'mobile', 'api']
export type SDKTypes = (typeof SDKTypeValues)[number]

export type QueryParams = { [key: string]: string }

export enum DEFAULT_REASONS {
    MISSING_CONFIG = 'MISSING_CONFIG',
    MISSING_VARIABLE = 'MISSING_VARIABLE',
    MISSING_FEATURE = 'MISSING_FEATURE',
    MISSING_VARIATION = 'MISSING_VARIATION',
    MISSING_VARIABLE_FOR_VARIATION = 'MISSING_VARIABLE_FOR_VARIATION',
    USER_NOT_IN_ROLLOUT = 'USER_NOT_IN_ROLLOUT',
    USER_NOT_TARGETED = 'USER_NOT_TARGETED',
    INVALID_VARIABLE_TYPE = 'INVALID_VARIABLE_TYPE',
    UNKNOWN = 'UNKNOWN',
}

export enum EVAL_REASONS {
    TARGETING_MATCH = 'TARGETING_MATCH',
    SPLIT = 'SPLIT',
    DEFAULT = 'DEFAULT',
    DISABLED = 'DISABLED',
    ERROR = 'ERROR',
    OVERRIDE = 'OVERRIDE',
    OPT_IN = 'OPT_IN',
}

export enum EVAL_REASON_DETAILS {
    // All Users
    ALL_USERS = 'All Users',
    // Audiences
    AUDIENCE_MATCH = 'Audience Match',
    NOT_IN_AUDIENCE = 'Not in Audience',
    // Opt-In
    OPT_IN = 'Opt-In',
    NOT_OPTED_IN = 'Not Opt-In',
    // Overrides
    OVERRIDE = 'Override',
    // User Specific
    USER_ID = 'User ID',
    EMAIL = 'Email',
    COUNTRY = 'Country',
    PLATFORM = 'Platform',
    PLATFORM_VERSION = 'Platform Version',
    APP_VERSION = 'App Version',
    DEVICE_MODEL = 'Device Model',
    CUSTOM_DATA = 'Custom Data',
}

export type EvalReason = {
    reason: EVAL_REASONS | DEFAULT_REASONS
    details?: string
}

const boolTransform = ({ value }: { value: unknown }) => {
    if (value === 'true') {
        return true
    } else if (value === 'false') {
        return false
    }
    return value
}

const dateTransform = ({ value }: { value: string | number }) => {
    if (!value) return undefined
    const numberValue = Number(value)
    if (!isNaN(numberValue)) {
        // value is a time string
        return new Date(numberValue)
    } else {
        // value is a date-time string
        return new Date(value)
    }
}

export type DVCCustomDataJSON = {
    [key: string]: string | number | boolean | null
}

/**
 * Base API User Schema used by the Bucketing API where the only required field is user_id.
 */
export class DVCAPIUser {
    @IsBoolean()
    @IsOptional()
    @Transform(boolTransform)
    isAnonymous?: boolean

    @IsString()
    @IsNotBlank()
    @IsNotEmpty()
    user_id: string

    /**
     * Email used for identifying a device user in the dashboard,
     * or used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    email?: string

    /**
     * Name of the user which can be used for identifying a device user,
     * or used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    name?: string

    /**
     * ISO 639-1 two-letter codes
     */
    @IsISO6391()
    @IsString()
    @IsOptional()
    language?: string

    /**
     * ISO 3166 alpha-2
     */
    @IsISO31661Alpha2()
    @IsOptional()
    country?: string

    /**
     * Application Version, can be used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    appVersion?: string

    /**
     * Application Build, can be used for audience segmentation.
     */
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    appBuild?: number

    /**
     * Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will be logged to DevCycle's servers and available in the dashboard to view.
     */
    @IsDVCCustomDataJSONObject()
    @IsOptional()
    @Transform(({ value }) => (isString(value) ? JSON.parse(value) : value))
    customData?: DVCCustomDataJSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    @IsDVCCustomDataJSONObject()
    @IsOptional()
    @Transform(({ value }) => (isString(value) ? JSON.parse(value) : value))
    privateCustomData?: DVCCustomDataJSON

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @IsOptional()
    @Transform(dateTransform)
    createdDate?: Date

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @IsOptional()
    @Transform(dateTransform)
    lastSeenDate?: Date

    /**
     * Set by SDK to 'web'
     */
    @IsString()
    @IsOptional()
    platform?: string

    /**
     * Set by SDK to ??
     */
    @IsString()
    @IsOptional()
    platformVersion?: string

    /**
     * Set by SDK to User-Agent
     */
    @IsString()
    @IsOptional()
    deviceModel?: string

    /**
     * SDK type
     */
    @IsString()
    @IsOptional()
    @IsIn(['client', 'server', 'mobile', 'api'])
    @Transform(({ value }) => value)
    sdkType?: SDKTypes = 'api'

    /**
     * SDK Version
     */
    @IsString()
    @IsOptional()
    sdkVersion?: string
}

export class DVCBucketingUser extends DVCAPIUser {
    /**
     * JSON data recording user opt-in features.
     */
    @IsOptional()
    @Transform(({ value }) => (isString(value) ? JSON.parse(value) : value))
    optIns?: Record<string, boolean>
}

/**
 * Client API User Schema that extends the base DVCAPIUser schema to add fields
 * from the Client SDKs like: isAnonymous, isDebug.
 * Also changes certain fields to be required from the Client SDKs.
 */
export class DVCClientAPIUser implements DVCAPIUser {
    /**
     * Users must be explicitly defined as anonymous, where the SDK will
     * generate a random `user_id` for them. If they are `isAnonymous = false`
     * a `user_id` value must be provided.
     */
    @IsBoolean()
    @Transform(boolTransform)
    isAnonymous: boolean

    @IsString()
    @IsNotBlank()
    @IsNotEmpty()
    user_id: string

    /**
     * Email used for identifying a device user in the dashboard,
     * or used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    email?: string

    /**
     * Name of the user which can be used for identifying a device user,
     * or used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    name?: string

    /**
     * ISO 639-1 two-letter codes
     */
    @IsISO6391()
    @IsString()
    @IsOptional()
    language?: string

    /**
     * ISO 3166 alpha-2
     */
    @IsISO31661Alpha2()
    @IsOptional()
    country?: string

    /**
     * Application Version, can be used for audience segmentation.
     */
    @IsString()
    @IsOptional()
    appVersion?: string

    /**
     * Application Build, can be used for audience segmentation.
     */
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    appBuild?: number

    /**
     * Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will be logged to DevCycle's servers and available in the dashboard to view.
     */
    @IsDVCCustomDataJSONObject()
    @IsOptional()
    @Transform(({ value }) => (isString(value) ? JSON.parse(value) : value))
    customData?: DVCCustomDataJSON

    /**
     * Private Custom JSON data used for audience segmentation, must be limited to __kb in size.
     * Values will not be logged to DevCycle's servers and
     * will not be available in the dashboard.
     */
    @IsDVCCustomDataJSONObject()
    @IsOptional()
    @Transform(({ value }) => (isString(value) ? JSON.parse(value) : value))
    privateCustomData?: DVCCustomDataJSON

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @Transform(dateTransform)
    createdDate: Date

    /**
     * Set by SDK automatically
     */
    @IsDate()
    @Transform(dateTransform)
    lastSeenDate: Date

    /**
     * Set by SDK to 'web'
     */
    @IsString()
    @IsNotEmpty()
    platform: string

    /**
     * Set by SDK to ??
     */
    @IsString()
    @IsNotEmpty()
    platformVersion: string

    /**
     * Set by SDK to User-Agent
     */
    @IsString()
    @IsNotEmpty()
    deviceModel: string

    /**
     * SDK type
     */
    @IsString()
    @IsIn(['client', 'mobile'])
    sdkType: SDKTypes

    /**
     * SDK Version
     */
    @IsString()
    @IsNotEmpty()
    sdkVersion: string

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => (isString(value) ? value === 'true' : value))
    isDebug?: boolean
}

export class DVCOptInUser {
    @IsString()
    @IsNotBlank()
    @IsNotEmpty()
    user_id: string
}

export type SDKVariable = PublicVariable & {
    value: VariableValue
    _feature?: string
    evalReason?: EvalReason
}

export type SDKFeature = Pick<
    PublicFeature,
    '_id' | 'key' | 'type' | 'settings'
> & {
    _variation: string
    variationName: string
    variationKey: string
    evalReason?: EvalReason
}

type FeatureVariation = {
    _feature: string
    _variation: string
}

export interface BucketedUserConfig {
    /**
     * Project data used for logging
     */
    project: PublicProject

    /**
     * Environment data used for logging
     */
    environment: PublicEnvironment

    /**
     * Mapping of `ClientSDKFeature.key` to `ClientSDKFeature` values.
     * SDK uses this object to log `allBucketedFeatures()`
     */
    features: {
        [key: string]: SDKFeature
    }

    /**
     * Map of `feature._id` to `variation._id` used for event logging.
     */
    featureVariationMap: Record<string, string>

    /**
     * Map<`variable.key`, FeatureVariation> used for aggregated event logging.
     */
    variableVariationMap: Record<string, FeatureVariation>

    /**
     * Mapping of `ClientSDKDynamicVariable.key` to `ClientSDKDynamicVariable` values.
     * SDK uses this object to retrieve bucketed values for variables.
     */
    variables: {
        [key: string]: SDKVariable
    }

    /**
     * Information about how to establish a streaming connection to receive config updates
     */
    sse?: {
        url?: string
        // The number in milliseconds that the sdk should wait after the page is backgrounded
        // before it closes the streaming connection
        inactivityDelay?: number
    }

    /**
     * the etag representing the CDN config used to generate this bucketed config. Can be used to determine config
     * staleness.
     */
    etag?: string

    /**
     * Settings for the bucketed config.
     */
    settings?: {
        /**
         * If true, the bucketed config will filter out featureVars per evaluation.
         */
        filterFeatureVars?: boolean
    }
}

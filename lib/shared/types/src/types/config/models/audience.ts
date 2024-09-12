/**
 * Supported filter comparators
 */
export enum FilterComparator {
    '=' = '=',
    '!=' = '!=',
    '>' = '>',
    '>=' = '>=',
    '<' = '<',
    '<=' = '<=',
    'exist' = 'exist',
    '!exist' = '!exist',
    'contain' = 'contain',
    '!contain' = '!contain',
    'startWith' = 'startWith',
    '!startWith' = '!startWith',
    'endWith' = 'endWith',
    '!endWith' = '!endWith',
}

export enum BooleanFilterComparator {
    '=' = '=',
    'exist' = 'exist',
    '!exist' = '!exist',
}

export enum StringFilterComparator {
    '=' = '=',
    '!=' = '!=',
    'exist' = 'exist',
    '!exist' = '!exist',
    'contain' = 'contain',
    '!contain' = '!contain',
    'startWith' = 'startWith',
    '!startWith' = '!startWith',
    'endWith' = 'endWith',
    '!endWith' = '!endWith',
}

export enum NumberFilterComparator {
    '=' = '=',
    '!=' = '!=',
    '>' = '>',
    '>=' = '>=',
    '<' = '<',
    '<=' = '<=',
    'exist' = 'exist',
    '!exist' = '!exist',
}

export enum SemverFilterComparator {
    '=' = '=',
    '!=' = '!=',
    '>' = '>',
    '>=' = '>=',
    '<' = '<',
    '<=' = '<=',
    'exist' = 'exist',
    '!exist' = '!exist',
}

/**
 * Supported filter types, defines high-level audience type.
 */
export enum FilterType {
    all = 'all',
    user = 'user',
    optIn = 'optIn',
    audienceMatch = 'audienceMatch',
    custom = 'custom',
    // TODO: Implement later
    // listAudience = 'listAudience'
}

/**
 * Supported `subType` values for `type = 'user'` filters
 */
export enum UserSubType {
    user_id = 'user_id',
    email = 'email',
    ip = 'ip',
    country = 'country',
    platform = 'platform',
    platformVersion = 'platformVersion',
    appVersion = 'appVersion',
    deviceModel = 'deviceModel',
    customData = 'customData',
}

/**
 * ** TODO: Implement later **
 * Supported `subType` values for `type = 'listAudience'` filters.
 */
export enum ListAudienceSubType {
    mixpanel = 'mixpanel',
    csv = 'csv',
}

/**
 * Supported data key types
 */
export enum DataKeyType {
    string = 'String',
    boolean = 'Boolean',
    number = 'Number',
    semver = 'Semver',
}

export enum AudienceOperator {
    and = 'and',
    or = 'or',
}

export class AudienceFilter<IdType = string> {
    /**
     * Filter type of this audience filter (user, audienceTemplate etc.)
     */
    type: FilterType

    /**
     * Sub type of this filter (appVersion, mixpanel etc.)
     */
    subType?: UserSubType

    /**
     * Comparator to use if this is a filter
     */
    comparator: FilterComparator

    /**
     * Data Key used for custom data and other filter sub-type that require a key-value mapping.
     */
    dataKey?: string

    /**
     * Data Key used for custom data and other filter sub-type that require a key-value mapping.
     */
    dataKeyType?: DataKeyType

    /**
     * Filter values to segment against, must be set for all filter types other than 'all'
     */
    values?: string[] | boolean[] | number[]

    /**
     * Array of audience id's for filters of type audienceMatch
     */
    _audiences?: IdType[]
}

/**
 * Audience filter used to describe a segmentation for a user audience.
 */
export class AudienceFilterOrOperator<IdType = string> {
    /**
     * Filter type of this audience filter (user, audienceTemplate etc.)
     */
    type?: FilterType

    /**
     * Sub type of this filter (appVersion, mixpanel etc.)
     */
    subType?: UserSubType

    /**
     * Comparator to use if this is a filter
     */
    comparator?: FilterComparator

    /**
     * Data Key used for custom data and other filter sub-type that require a key-value mapping.
     */
    dataKey?: string

    /**
     * Data Key used for custom data and other filter sub-type that require a key-value mapping.
     */
    dataKeyType?: DataKeyType

    /**
     * Filter values to segment against, must be set for all filter types other than 'all'
     */
    values?: string[] | boolean[] | number[]

    /**
     * Operator type if this object represents an operator, and not a filter
     */
    operator?: AudienceOperator

    /**
     * Array of audience id's for filters of type audienceMatch
     */
    _audiences?: IdType[]

    /**
     * Filters to apply using the "operator" operation if this is an operator object
     */
    filters?: AudienceFilterOrOperator<IdType>[]
    
    /**
     * Custom filter data for filters of type 'custom'
     */
    customFilter?: any
}

/**
 * ** Initially only `and` operator will be supported **
 * Special filter used to establish a boolean operator. Can be used for top-level OR, etc.
 */
export class TopLevelOperator<IdType = string> {
    filters: AudienceFilterOrOperator<IdType>[]

    operator: AudienceOperator
}

/**
 * Audience model used for describing a user segmenting audience
 */
export class Audience<IdType = string> {
    /**
     * Mongo primary _id.
     */
    _id: IdType

    /**
     * Audience filters, describing logic for segmenting users
     */
    filters: TopLevelOperator<IdType>
}

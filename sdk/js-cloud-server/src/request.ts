import { DVCPopulatedUser } from './models/populatedUser'
import { DevCycleEvent } from './types'
import { DevCycleServerSDKOptions } from '@devcycle/types'
import { post } from '@devcycle/server-request'
import { VariableKey } from '@devcycle/js-client-sdk'

export const HOST = '.devcycle.com'

const BUCKETING_BASE = 'https://bucketing-api'
const VARIABLES_PATH = '/v1/variables'
const FEATURES_PATH = '/v1/features'
const TRACK_PATH = '/v1/track'
const BUCKETING_URL = `${BUCKETING_BASE}${HOST}`
const EDGE_DB_QUERY_PARAM = '?enableEdgeDB='

export async function getAllFeatures(
    user: DVCPopulatedUser,
    sdkKey: string,
    options: DevCycleServerSDKOptions,
): Promise<Response> {
    const baseUrl = `${
        options.bucketingAPIURI || BUCKETING_URL
    }${FEATURES_PATH}`
    const postUrl = baseUrl.concat(
        options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '',
    )
    return await post(
        postUrl,
        {
            body: JSON.stringify(user),
            retries: 5,
        },
        sdkKey,
    )
}

export async function getAllVariables(
    user: DVCPopulatedUser,
    sdkKey: string,
    options: DevCycleServerSDKOptions,
): Promise<Response> {
    const baseUrl = `${
        options.bucketingAPIURI || BUCKETING_URL
    }${VARIABLES_PATH}`
    const postUrl = baseUrl.concat(
        options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '',
    )
    return await post(
        postUrl,
        {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
            retries: 5,
        },
        sdkKey,
    )
}

export async function getVariable(
    user: DVCPopulatedUser,
    sdkKey: string,
    variableKey: VariableKey,
    options: DevCycleServerSDKOptions,
): Promise<Response> {
    const baseUrl = `${
        options.bucketingAPIURI || BUCKETING_URL
    }${VARIABLES_PATH}/${variableKey}`
    const postUrl = baseUrl.concat(
        options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '',
    )
    return await post(
        postUrl,
        {
            body: JSON.stringify(user),
            retries: 5,
        },
        sdkKey,
    )
}

export async function postTrack(
    user: DVCPopulatedUser,
    event: DevCycleEvent,
    sdkKey: string,
    options: DevCycleServerSDKOptions,
): Promise<void> {
    const baseUrl = `${options.bucketingAPIURI || BUCKETING_URL}${TRACK_PATH}`
    const postUrl = baseUrl.concat(
        options.enableEdgeDB ? EDGE_DB_QUERY_PARAM.concat('true') : '',
    )
    await post(
        postUrl,
        {
            body: JSON.stringify({
                user,
                events: [event],
            }),
            retries: 5,
        },
        sdkKey,
    )
}

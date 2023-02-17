import {
    DVCOptions,
    DVCVariableValue,
    DVCVariable as DVCVariableInterface,
    DVCVariableSet,
    DVCFeatureSet,
    DVCEvent
} from './types'
import { DVCVariable } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { dvcDefaultLogger } from './utils/logger'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCLogger, getVariableTypeFromValue } from '@devcycle/types'
import { getAllFeatures, getAllVariables, getVariable, postTrack, ResponseError } from './request'
import { DVCUser } from './models/user'

const castIncomingUser = (user: DVCUser) => {
    if (!(user instanceof DVCUser)) {
        return new DVCUser(user)
    }
    return user
}

/**
 * Handle response errors from API
 * Suppress 5xx errors and log them instead while returning defaults to the caller
 * Throw 4XX errors back to the caller to notify of invalid SDK usage
 * Special handling of 404 error, which indicates "variable not found"
 * @param err
 */
const throwIfUserError = (err: unknown) => {
    if (err instanceof ResponseError) {
        const code = err.status

        // throw the error if it indicates there was user error in this call
        // (e.g. invalid auth credentials or bad user data)
        if (code !== 404 && code < 500) {
            throw new Error(`DevCycle request failed with status ${code}. ${err.message || ''}`)
        }

        // Catch non-4xx errors so we can log them instead
        return
    }

    if (err instanceof SyntaxError) {
        // JSON parse error, log instead of throwing
        return
    }

    // if not a ResponseError, throw it
    throw err
}

export class DVCCloudClient {
    private sdkKey: string
    private logger: DVCLogger
    private options: DVCOptions

    constructor(sdkKey: string, options: DVCOptions) {
        this.sdkKey = sdkKey
        this.logger = options.logger || dvcDefaultLogger({ level: options.logLevel })
        this.options = options
        this.logger.info('Running DevCycle NodeJS SDK in Cloud Bucketing mode')
    }

    variable(user: DVCUser, key: string, defaultValue: DVCVariableValue): Promise<DVCVariableInterface> {
        const incomingUser = castIncomingUser(user)

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)

        checkParamDefined('key', key)
        checkParamDefined('defaultValue', defaultValue)
        const type = getVariableTypeFromValue(defaultValue, key, this.logger, true)

        return getVariable(populatedUser, this.sdkKey, key, this.options)
            .then(async (res: Response) => {
                const variableResponse = await res.json()
                if (variableResponse.type !== type) {
                    this.logger.error(
                        `Type mismatch for variable ${key}. Expected ${type}, got ${variableResponse.type}`
                    )
                    return new DVCVariable({
                        defaultValue,
                        type,
                        key
                    })
                }
                return new DVCVariable({
                    ...variableResponse,
                    defaultValue
                })
            })
            .catch((err: unknown) => {
                throwIfUserError(err)
                this.logger.error(
                    `Request to get variable: ${key} failed with response message: ${(err as any).message}`
                )
                return new DVCVariable({
                    defaultValue,
                    type,
                    key
                })
            })
    }

    allVariables(user: DVCUser): Promise<DVCVariableSet> {
        const incomingUser = castIncomingUser(user)

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)

        return getAllVariables(populatedUser, this.sdkKey, this.options)
            .then(async (res: Response) => {
                const variablesResponse = await res.json()

                return variablesResponse || {}
            })
            .catch((err: unknown) => {
                throwIfUserError(err)
                this.logger.error(
                    `Request to get all variable failed with response message: ${(err as any).message}`
                )
                return {}
            })
    }

    allFeatures(user: DVCUser): Promise<DVCFeatureSet> {
        const incomingUser = castIncomingUser(user)

        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)

        return getAllFeatures(populatedUser, this.sdkKey, this.options)
            .then(async (res: Response) => {
                const featuresResponse = await res.json()

                return featuresResponse || {}
            })
            .catch((err: unknown) => {
                throwIfUserError(err)
                this.logger.error(`Request to get all features failed with response message: ${(err as any).message}`)
                return {}
            })
    }

    track(user: DVCUser, event: DVCEvent): Promise<void> {
        const incomingUser = castIncomingUser(user)

        if (event === undefined || event === null || typeof event.type !== 'string' || event.type.length === 0) {
            throw new Error('Invalid Event')
        }
        checkParamDefined('type', event.type)
        const populatedUser = DVCPopulatedUser.fromDVCUser(incomingUser)
        return postTrack(populatedUser, event, this.sdkKey, this.options)
            .then(() => {
                this.logger.debug('DVC Event Tracked')
            }).catch((err: unknown) => {
                throwIfUserError(err)
                this.logger.error(`DVC Error Tracking Event. Response message: ${(err as any).message}`)
            })
    }
}

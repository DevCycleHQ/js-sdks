import {
    DVCOptions,
    DVCVariableValue,
    DVCVariable as DVCVariableInterface,
    DVCVariableSet,
    DVCFeatureSet,
    DVCEvent,
    DVCUser
} from './types'
import { DVCVariable } from './models/variable'
import { checkParamDefined } from './utils/paramUtils'
import { dvcDefaultLogger } from './utils/logger'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCLogger, getVariableTypeFromValue } from '@devcycle/types'
import { getAllFeatures, getAllVariables, getVariable, postTrack } from './request'
import { AxiosError, AxiosResponse } from 'axios'

export class DVCCloudClient {
    private environmentKey: string
    private logger: DVCLogger
    private options: DVCOptions

    constructor(environmentKey: string, options: DVCOptions) {
        this.environmentKey = environmentKey
        this.logger = options.logger || dvcDefaultLogger({ level: options.logLevel })
        this.options = options
        this.logger.info('Running DevCycle NodeJS SDK in Cloud Bucketing mode')
    }

    variable(user: DVCUser, key: string, defaultValue: DVCVariableValue): Promise<DVCVariableInterface> {
        const requestUser = new DVCPopulatedUser(user)

        checkParamDefined('key', key)
        checkParamDefined('defaultValue', defaultValue)
        const type = getVariableTypeFromValue(defaultValue, key, this.logger, true)
        return getVariable(requestUser, this.environmentKey, key, this.options)
            .then((res: AxiosResponse) => {
                const variable = res.data
                if (variable.type !== type) {
                    this.logger.error(
                        `Type mismatch for variable ${key}. Expected ${type}, got ${variable.type}`
                    )
                    return new DVCVariable({
                        defaultValue,
                        key
                    })
                }
                return new DVCVariable({
                    ...variable,
                    defaultValue
                })
            })
            .catch((err: AxiosError) => {
                this.logger.error(`Request to get variable: ${key} failed with response message: ${err.message}`)
                return new DVCVariable({
                    defaultValue,
                    key
                })
            })
    }

    allVariables(user: DVCUser): Promise<DVCVariableSet> {
        const requestUser = new DVCPopulatedUser(user)
        return getAllVariables(requestUser, this.environmentKey, this.options)
            .then((res: AxiosResponse) => {
                return res.data || {}
            })
            .catch((err: AxiosError) => {
                this.logger.error(`Request to get all variable failed with response message: ${err.message}`)
                return {}
            })
    }

    allFeatures(user: DVCUser): Promise<DVCFeatureSet> {
        const requestUser = new DVCPopulatedUser(user)
        return getAllFeatures(requestUser, this.environmentKey, this.options)
            .then((res: AxiosResponse) => {
                return res.data || {}
            })
            .catch((err: AxiosError) => {
                this.logger.error(`Request to get all features failed with response message: ${err.message}`)
                return {}
            })
    }

    track(user: DVCUser, event: DVCEvent): void {
        if (event === undefined || event === null || typeof event.type !== 'string' || event.type.length === 0) {
            throw new Error('Invalid Event')
        }
        checkParamDefined('type', event.type)
        const requestUser = new DVCPopulatedUser(user)
        postTrack(requestUser, event, this.environmentKey, this.logger, this.options)
    }
}

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
import { EventTypes } from './models/requestEvent'
import { dvcDefaultLogger } from './utils/logger'
import { DVCPopulatedUser } from './models/populatedUser'
import { DVCLogger } from '@devcycle/types'
import { getAllFeatures, getAllVariables, getVariable, postTrack } from './request'
import { AxiosError, AxiosResponse } from 'axios'


export class DVCCloudClient {
    private environmentKey: string
    private logger: DVCLogger

    constructor(environmentKey: string, options: DVCOptions) {
        this.environmentKey = environmentKey
        this.logger = options.logger || dvcDefaultLogger({ level: options.logLevel })
        this.logger.info(`Running DevCycle NodeJS SDK in Cloud Bucketing mode`)
    }

    variable(user: DVCUser, key: string, defaultValue: DVCVariableValue): Promise<DVCVariableInterface> {
        const requestUser = new DVCPopulatedUser(user)

        return getVariable(requestUser, this.environmentKey, key)
            .then((res: AxiosResponse) => {
                return new DVCVariable({
                    ...res.data,
                    defaultValue
                })
            })
            .catch((err: AxiosError) => {
                this.logger.error(`Request to get variable with key: ${key} failed with, ` +
                    `response message: ${err.message}, response data ${err?.response?.data.toString()}`)

                return new DVCVariable({
                    value: defaultValue,
                    defaultValue,
                    key
                })
            })
    }

    allVariables(user: DVCUser): Promise<DVCVariableSet> | DVCVariableSet {
        const requestUser = new DVCPopulatedUser(user)
        return getAllVariables(requestUser, this.environmentKey)
            .then((res: AxiosResponse) => {
                return res.data || {}
            })
            .catch((err: AxiosError) => {
                this.logger.error(`Request to get all variable failed with ` +
                    `response message: ${err.message}, response data ${err?.response?.data}`)

                return {}
            })
    }

    allFeatures(user: DVCUser): Promise<DVCFeatureSet> | DVCFeatureSet {

        const requestUser = new DVCPopulatedUser(user)
        return getAllFeatures(requestUser, this.environmentKey)
            .then((res: AxiosResponse) => {
                return res.data || {}
            })
            .catch((err: AxiosError) => {
                this.logger.error(`Request to get all features failed with ` +
                    `response message: ${err.message}, response data ${err?.response?.data}`)

                return {}
            })
    }

    track(user: DVCUser, event: DVCEvent): void {
        checkParamDefined('type', event.type)
        const requestUser = new DVCPopulatedUser(user)
        postTrack(requestUser, event, this.environmentKey)
    }
}

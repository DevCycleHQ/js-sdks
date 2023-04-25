import { DVCFeatureSet, DVCVariableSet } from './types'
import { DVCVariable } from './Variable'
import { checkParamType } from './utils'

const EventNames = {
    INITIALIZED: 'initialized',
    NEW_VARIABLES: 'newVariables',
    ERROR: 'error',
    VARIABLE_UPDATED: 'variableUpdated',
    FEATURE_UPDATED: 'featureUpdated',
    CONFIG_UPDATED: 'configUpdated',
    VARIABLE_EVALUATED: 'variableEvaluated',
}

type EventHandler = (...args: any[]) => void

const isInvalidEventKey = (key: string): boolean => {
    return (
        !Object.values(EventNames).includes(key) &&
        !key.startsWith(EventNames.VARIABLE_UPDATED) &&
        !key.startsWith(EventNames.FEATURE_UPDATED) &&
        !key.startsWith(EventNames.NEW_VARIABLES) &&
        !key.startsWith(EventNames.VARIABLE_EVALUATED)
    )
}

export class EventEmitter {
    handlers: Record<string, EventHandler[]>

    constructor() {
        this.handlers = {}
    }

    subscribe(key: string, handler: EventHandler): void {
        checkParamType('key', key, 'string')
        checkParamType('handler', handler, 'function')

        if (isInvalidEventKey(key)) {
            throw new Error('Not a valid event to subscribe to')
        }

        if (!this.handlers[key]) {
            this.handlers[key] = [handler]
        } else {
            this.handlers[key].push(handler)
        }
    }

    unsubscribe(key: string, handler?: EventHandler): void {
        checkParamType('key', key, 'string')

        if (isInvalidEventKey(key)) {
            return
        }

        if (handler) {
            const handlerIndex = this.handlers[key].findIndex(
                (h) => h === handler
            )

            this.handlers[key].splice(handlerIndex, 1)
        } else {
            this.handlers[key] = []
        }
    }

    emit(key: string, ...args: any[]): void {
        checkParamType('key', key, 'string')

        this.handlers[key]?.forEach((handler) => {
            new Promise((resolve) => {
                handler(...args)
                resolve(true)
            })
        })
    }

    emitInitialized(success: boolean): void {
        this.emit(EventNames.INITIALIZED, success)
    }

    emitError(error: unknown): void {
        this.emit(EventNames.ERROR, error)
    }

    emitConfigUpdate(newVariableSet: DVCVariableSet): void {
        this.emit(EventNames.CONFIG_UPDATED, newVariableSet)
    }

    emitVariableEvaluated(variable: DVCVariable<any>): void {
        this.emit(`${EventNames.VARIABLE_EVALUATED}:*`, variable)
        this.emit(`${EventNames.VARIABLE_EVALUATED}:${variable.key}`, variable)
    }

    emitVariableUpdates(
        oldVariableSet: DVCVariableSet,
        newVariableSet: DVCVariableSet,
        variableDefaultMap: {
            [key: string]: { [defaultValue: string]: DVCVariable<any> }
        }
    ): void {
        const keys = new Set(
            Object.keys(oldVariableSet).concat(Object.keys(newVariableSet))
        )
        let newVariables = false
        keys.forEach((key) => {
            const oldVariableValue =
                oldVariableSet[key] && oldVariableSet[key].value
            const newVariable = newVariableSet[key]
            const newVariableValue = newVariable && newVariableSet[key].value

            if (
                JSON.stringify(oldVariableValue) !==
                JSON.stringify(newVariableValue)
            ) {
                const variables =
                    variableDefaultMap[key] &&
                    Object.values(variableDefaultMap[key])
                if (variables) {
                    newVariables = true
                    variables.forEach((variable) => {
                        variable.value =
                            newVariableValue ?? variable.defaultValue
                        variable.isDefaulted =
                            newVariableValue === undefined ||
                            newVariableValue === null
                        variable.callback?.call(variable, variable.value)
                    })
                }
                const finalVariable = newVariable || null
                this.emit(
                    `${EventNames.VARIABLE_UPDATED}:*`,
                    key,
                    finalVariable
                )
                this.emit(
                    `${EventNames.VARIABLE_UPDATED}:${key}`,
                    key,
                    finalVariable
                )
            }
        })
        if (newVariables) {
            this.emit(`${EventNames.NEW_VARIABLES}`)
        }
    }

    emitFeatureUpdates(
        oldFeatureSet: DVCFeatureSet,
        newFeatureSet: DVCFeatureSet
    ): void {
        const keys = Object.keys(oldFeatureSet).concat(
            Object.keys(newFeatureSet)
        )
        keys.forEach((key) => {
            const oldFeatureVariation =
                oldFeatureSet[key] && oldFeatureSet[key]._variation
            const newFeature = newFeatureSet[key]
            const newFeatureVariation =
                newFeature && newFeatureSet[key]._variation

            const finalFeature = newFeature || null
            if (oldFeatureVariation !== newFeatureVariation) {
                this.emit(`${EventNames.FEATURE_UPDATED}:*`, key, finalFeature)
                this.emit(
                    `${EventNames.FEATURE_UPDATED}:${key}`,
                    key,
                    finalFeature
                )
            }
        })
    }
}

import { DVCFeatureSet, DVCVariableSet } from './types'
import { DVCVariable } from './Variable'
import { checkParamType } from './utils'

const EventNames = {
    INITIALIZED: 'initialized',
    NEW_VARIABLES: 'newVariables',
    ERROR: 'error',
    VARIABLE_UPDATED: 'variableUpdated',
    FEATURE_UPDATED: 'featureUpdated',
}

type eventHandler = (...args: any[]) => void

export class EventEmitter {
    events: Record<string, eventHandler[]>

    constructor() {
        this.events = {}
    }

    subscribe(key: string, handler: eventHandler): void {
        checkParamType('key', key, 'string')
        checkParamType('handler', handler, 'function')

        const eventNames = Object.keys(EventNames).map((e) => e.toLowerCase())
        if (!eventNames.includes(key) &&
            !key.startsWith(EventNames.VARIABLE_UPDATED) &&
            !key.startsWith(EventNames.FEATURE_UPDATED) &&
            !key.startsWith(EventNames.NEW_VARIABLES)) {
            throw new Error('Not a valid event to subscribe to')
        } else if (!this.events[key]) {
            this.events[key] = [ handler ]
        } else {
            this.events[key].push(handler)
        }
    }

    unsubscribe(key: string, handler?: eventHandler): void {
        checkParamType('key', key, 'string')

        const eventNames = Object.keys(EventNames).map((e) => e.toLowerCase())
        if (!eventNames.includes(key)) {
            return
        } else if (!handler) {
            this.events[key] = []
        } else {
            this.events[key] = this.events[key].filter((eventHandler) => eventHandler !== handler)
        }
    }

    emit(key: string, ...args: any[]): void {
        checkParamType('key', key, 'string')

        const handlers = this.events[key]
        if (!handlers) {
            this.events[key] = []
            return
        }

        handlers.forEach((handler) => {
            handler(...args)
        })
    }

    emitInitialized(success: boolean): void {
        this.emit(EventNames.INITIALIZED, success)
    }

    emitError(error: unknown): void {
        this.emit(EventNames.ERROR, error)
    }

    emitVariableUpdates(
        oldVariableSet: DVCVariableSet,
        newVariableSet: DVCVariableSet,
        variableDefaultMap: { [key: string]: { [defaultValue: string]: DVCVariable<any> } }
    ): void {
        const keys = new Set(Object.keys(oldVariableSet).concat(Object.keys(newVariableSet)))
        let newVariables = false
        keys.forEach((key) => {
            const oldVariableValue = oldVariableSet[key] && oldVariableSet[key].value
            const newVariable = newVariableSet[key]
            const newVariableValue = newVariable && newVariableSet[key].value

            if (JSON.stringify(oldVariableValue) !== JSON.stringify(newVariableValue)) {
                const defaultVariables = variableDefaultMap[key] && Object.values(variableDefaultMap[key])
                if (defaultVariables) {
                    newVariables = true
                    defaultVariables.forEach((variable) => {
                        variable.value = newVariableValue ?? variable.defaultValue
                        variable.isDefaulted = newVariableValue === undefined || newVariableValue === null
                        variable.callback?.call(variable, variable.value)
                    })
                }
                const finalVariable = newVariable || new DVCVariable({
                    key: key,
                    defaultValue: defaultVariables?.[0].value || {}
                })
                this.emit(`${EventNames.VARIABLE_UPDATED}:*`, key, finalVariable)
                this.emit(`${EventNames.VARIABLE_UPDATED}:${key}`, key, finalVariable)
            }
        })
        if (newVariables) {
            this.emit(`${EventNames.NEW_VARIABLES}`)
        }
    }

    emitFeatureUpdates(oldFeatureSet: DVCFeatureSet, newFeatureSet: DVCFeatureSet): void {
        const keys = Object.keys(oldFeatureSet).concat(Object.keys(newFeatureSet))
        keys.forEach((key) => {
            const oldFeatureVariation = oldFeatureSet[key] && oldFeatureSet[key]._variation
            const newFeature = newFeatureSet[key]
            const newFeatureVariation = newFeature && newFeatureSet[key]._variation

            if (oldFeatureVariation !== newFeatureVariation) {
                this.emit(`${EventNames.FEATURE_UPDATED}:*`, key, newFeature)
                this.emit(`${EventNames.FEATURE_UPDATED}:${key}`, key, newFeature)
            }
        })
    }
}
